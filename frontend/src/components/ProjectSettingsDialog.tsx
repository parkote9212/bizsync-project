import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import client from "../api/client";
import ProjectMembersTab from "./ProjectMembersTab";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import { createToastState, closeToast, type ToastState } from "../utils/toast";

/**
 * 프로젝트 설정 다이얼로그 Props
 */
interface ProjectSettingsDialogProps {
  /** 다이얼로그 열림/닫힘 상태 */
  open: boolean;
  /** 다이얼로그 닫기 콜백 */
  onClose: () => void;
  /** 프로젝트 ID */
  projectId: string | undefined;
  /** 프로젝트 정보 업데이트 후 콜백 */
  onUpdate: () => void;
}

/**
 * 프로젝트 데이터 인터페이스
 */
interface ProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
}

/**
 * 프로젝트 설정 다이얼로그 컴포넌트
 *
 * <p>프로젝트 정보를 수정하고 삭제할 수 있는 다이얼로그입니다.
 * 프로젝트명, 설명, 기간, 예산을 수정할 수 있으며, 프로젝트 취소 기능도 제공합니다.
 *
 * @component
 * @param {ProjectSettingsDialogProps} props - 컴포넌트 props
 * @returns {JSX.Element} 프로젝트 설정 다이얼로그
 */
const ProjectSettingsDialog: React.FC<ProjectSettingsDialogProps> = ({
  open,
  onClose,
  projectId,
  onUpdate,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    totalBudget: 0,
  });
  const [nameError, setNameError] = useState("");
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchProjectInfo = useCallback(async () => {
    try {
      const response = await client.get(`/projects/${projectId}/board`);
      const project = response.data.project;
      setProjectData({
        name: project.name || "",
        description: project.description || "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        totalBudget: project.totalBudget || 0,
      });
    } catch (error) {
      console.error("프로젝트 정보 로드 실패:", error);
    }
  }, [projectId]);

  // 프로젝트 정보 로드
  useEffect(() => {
    if (open && projectId) {
      fetchProjectInfo();
    }
  }, [open, projectId, fetchProjectInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: name === "totalBudget" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!projectData.name.trim()) {
      setNameError("프로젝트 이름은 필수입니다.");
      return;
    }

    setNameError("");
    try {
      setLoading(true);
      await client.put(`/projects/${projectId}`, projectData);
      setToast(createToastState("프로젝트가 수정되었습니다.", "success"));
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("프로젝트 수정 실패:", error);
      const errorMessage = error.response?.data?.message || "프로젝트 수정에 실패했습니다.";
      setToast(createToastState(errorMessage, "error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await client.delete(`/projects/${projectId}`);
      setToast(createToastState("프로젝트가 취소되었습니다.", "success"));
      window.location.href = "/projects"; // 프로젝트 목록으로 이동
    } catch (error: any) {
      console.error("프로젝트 취소 실패:", error);
      const errorMessage = error.response?.data?.message || "프로젝트 취소에 실패했습니다.";
      setToast(createToastState(errorMessage, "error"));
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight="bold">프로젝트 설정</DialogTitle>
      <DialogContent>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
          <Tab label="기본 정보" />
          <Tab label="멤버 관리" />
          <Tab label="위험 영역" />
        </Tabs>

        {currentTab === 0 && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="프로젝트 이름"
              name="name"
              value={projectData.name}
              onChange={(e) => {
                handleChange(e);
                if (nameError) setNameError("");
              }}
              fullWidth
              required
              error={!!nameError}
              helperText={nameError}
            />
            <TextField
              label="설명"
              name="description"
              value={projectData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="시작일"
                name="startDate"
                type="date"
                value={projectData.startDate}
                onChange={handleChange}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="종료일"
                name="endDate"
                type="date"
                value={projectData.endDate}
                onChange={handleChange}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <TextField
              label="예산 (원)"
              name="totalBudget"
              type="number"
              value={projectData.totalBudget}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
        )}

        {currentTab === 1 && <ProjectMembersTab projectId={projectId} />}

        {currentTab === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              위험한 작업입니다. 신중하게 진행해주세요.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={loading}
            >
              프로젝트 취소
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {currentTab === 1 ? "닫기" : "취소"}
        </Button>
        {currentTab === 0 && (
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            저장
          </Button>
        )}
      </DialogActions>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => closeToast(setToast)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="프로젝트 취소"
        message="프로젝트를 취소하시겠습니까?\n프로젝트 상태가 취소로 변경되며, 통계에 반영됩니다."
        confirmText="취소"
        cancelText="닫기"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Dialog>
  );
};

export default ProjectSettingsDialog;
