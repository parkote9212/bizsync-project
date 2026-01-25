import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import client from "../api/client";
import ConfirmDialog from "./ConfirmDialog";
import Toast from "./Toast";
import { createToastState, closeToast, type ToastState } from "../utils/toast";

/**
 * 업무 상세 다이얼로그 Props
 */
interface TaskDetailDialogProps {
  /** 업무 ID (null인 경우 다이얼로그가 닫힌 상태) */
  taskId: number | null;
  /** 다이얼로그 열림/닫힘 상태 */
  open: boolean;
  /** 다이얼로그 닫기 콜백 */
  onClose: () => void;
  /** 수정/삭제 후 목록 새로고침 콜백 */
  onUpdate: () => Promise<void>;
}

/**
 * 업무 상세 정보 인터페이스
 */
interface TaskDetail {
  taskId: number;
  title: string;
  content: string;
  deadline: string;
  workerName: string;
  workerId: number | null;
  columnName: string;
}

/**
 * 업무 상세 다이얼로그 컴포넌트
 *
 * <p>업무의 상세 정보를 조회하고, 수정 및 삭제할 수 있는 다이얼로그입니다.
 * 업무 제목, 설명, 마감일, 담당자 정보를 표시하고 수정할 수 있습니다.
 *
 * @component
 * @param {TaskDetailDialogProps} props - 컴포넌트 props
 * @returns {JSX.Element | null} 업무 상세 다이얼로그 (task가 없으면 null)
 */
const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  taskId,
  open,
  onClose,
  onUpdate,
}) => {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    workerName: "",
    workerId: "",
    deadline: "",
  });

  /**
   * 업무 상세 정보 조회
   *
   * @returns {Promise<TaskDetail | null>} 업무 상세 정보 (taskId가 없으면 null)
   */
  const fetchTaskDetail = useCallback(async (): Promise<TaskDetail | null> => {
    if (!taskId) return null;
    const response = await client.get(`/tasks/${taskId}`);
    return response.data as TaskDetail;
  }, [taskId]);

  useEffect(() => {
    if (!open || !taskId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchTaskDetail();
        if (!cancelled && data) {
          setTask(data);
          setEditForm({
            title: data.title,
            content: data.content || "",
            workerName: data.workerName || "",
            workerId: data.workerId ? String(data.workerId) : "",
            deadline: data.deadline || "",
          });
          setIsEditing(false);
        }
      } catch (error) {
        console.error("업무 상세 조회 실패", error);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, taskId, fetchTaskDetail]);

  /**
   * 업무 수정 처리
   *
   * <p>수정된 업무 정보를 서버에 저장하고 목록을 새로고침합니다.
   */
  const handleUpdate = async () => {
    if (!taskId) return;
    try {
      await client.put(`/tasks/${taskId}`, {
        title: editForm.title,
        content: editForm.content,
        deadline: editForm.deadline,
        workerId: editForm.workerId ? Number(editForm.workerId) : null,
      });
      setToast(createToastState("수정되었습니다.", "success"));
      setIsEditing(false);
      const data = await fetchTaskDetail();
      if (data) {
        setTask(data);
        setEditForm({
          title: data.title,
          content: data.content || "",
          workerName: data.workerName || "",
          workerId: data.workerId ? String(data.workerId) : "",
          deadline: data.deadline || "",
        });
      }
      await onUpdate();
    } catch (error: any) {
      console.error("수정 실패", error);
      const errorMessage = error.response?.data?.message || "수정 중 오류가 발생했습니다.";
      setToast(createToastState(errorMessage, "error"));
    }
  };

  /**
   * 업무 삭제 처리
   *
   * <p>업무를 삭제하고 목록을 새로고침한 후 다이얼로그를 닫습니다.
   */
  const handleDelete = async () => {
    if (!taskId) return;
    try {
      await client.delete(`/tasks/${taskId}`);
      setToast(createToastState("업무가 삭제되었습니다.", "success"));
      await onUpdate();
      onClose();
    } catch (error: any) {
      console.error("삭제 실패", error);
      const errorMessage = error.response?.data?.message || "삭제 중 오류가 발생했습니다.";
      setToast(createToastState(errorMessage, "error"));
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {isEditing ? (
        <>
          <DialogTitle>업무 수정</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="제목"
                fullWidth
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
              <TextField
                label="설명"
                fullWidth
                multiline
                rows={4}
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
              />
              <TextField
                label="마감일"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={editForm.deadline}
                onChange={(e) =>
                  setEditForm({ ...editForm, deadline: e.target.value })
                }
              />
              <TextField
                label="담당자 ID"
                type="number"
                fullWidth
                value={editForm.workerId}
                onChange={(e) =>
                  setEditForm({ ...editForm, workerId: e.target.value })
                }
                helperText="담당자 ID를 입력하거나 비워두면 변경하지 않습니다."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditing(false)}>취소</Button>
            <Button variant="contained" onClick={handleUpdate}>
              저장
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {task.title}
            <Chip
              label={task.columnName}
              size="small"
              color="primary"
              variant="outlined"
            />
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              마감일: {task.deadline} | 담당자: {task.workerName}
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", mt: 2, minHeight: 100 }}>
              {task.content || "설명이 없습니다."}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              삭제
            </Button>
            <Box>
              <Button onClick={onClose} sx={{ mr: 1 }}>
                닫기
              </Button>
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                수정
              </Button>
            </Box>
          </DialogActions>
        </>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="업무 삭제"
        message="정말 이 업무를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => closeToast(setToast)}
      />
    </Dialog>
  );
};

export default TaskDetailDialog;
