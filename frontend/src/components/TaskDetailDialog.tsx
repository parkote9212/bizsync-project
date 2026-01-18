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

interface TaskDetailDialogProps {
  taskId: number | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>; // 수정/삭제 후 목록 새로고침용
}

interface TaskDetail {
  taskId: number;
  title: string;
  content: string;
  deadline: string;
  workerName: string;
  columnName: string;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  taskId,
  open,
  onClose,
  onUpdate,
}) => {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 수정 폼 상태
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    deadline: "",
  });

  const fetchTaskDetail = useCallback(async (): Promise<TaskDetail | null> => {
    if (!taskId) return null;
    const response = await client.get(`/tasks/${taskId}`);
    return response.data as TaskDetail;
  }, [taskId]);

  // 상세 정보 로드 (언마운트 보호)
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
            deadline: data.deadline || "",
          });
          setIsEditing(false); // 모달 열릴 땐 항상 조회 모드
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

  const handleUpdate = async () => {
    if (!taskId) return;
    try {
      await client.put(`/tasks/${taskId}`, {
        ...editForm,
        workerId: null, // 담당자 변경은 일단 생략 (추후 구현)
      });
      alert("수정되었습니다.");
      setIsEditing(false);
      const data = await fetchTaskDetail();
      if (data) {
        setTask(data);
        setEditForm({
          title: data.title,
          content: data.content || "",
          deadline: data.deadline || "",
        });
      }
      await onUpdate(); // 부모(칸반보드) 갱신
    } catch (error) {
      console.error("수정 실패", error);
    }
  };

  const handleDelete = async () => {
    if (!taskId || !window.confirm("정말 이 업무를 삭제하시겠습니까?")) return;
    try {
      await client.delete(`/tasks/${taskId}`);
      await onUpdate();
      onClose();
    } catch (error) {
      console.error("삭제 실패", error);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {isEditing ? (
        // --- 수정 모드 ---
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
        // --- 조회 모드 ---
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
              onClick={handleDelete}
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
    </Dialog>
  );
};

export default TaskDetailDialog;
