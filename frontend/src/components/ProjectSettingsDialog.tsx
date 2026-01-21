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
import React, { useEffect, useState } from "react";
import client from "../api/client";
import ProjectMembersTab from "./ProjectMembersTab";

interface ProjectSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string | undefined;
  onUpdate: () => void;
}

interface ProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
}

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

  // 프로젝트 정보 로드
  useEffect(() => {
    if (open && projectId) {
      fetchProjectInfo();
    }
  }, [open, projectId]);

  const fetchProjectInfo = async () => {
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: name === "totalBudget" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!projectData.name.trim()) {
      alert("프로젝트 이름은 필수입니다.");
      return;
    }

    try {
      setLoading(true);
      await client.put(`/projects/${projectId}`, projectData);
      alert("프로젝트가 수정되었습니다.");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("프로젝트 수정 실패:", error);
      alert(error.response?.data?.message || "프로젝트 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("프로젝트를 삭제하시겠습니까?\n모든 데이터가 영구적으로 삭제됩니다.")) {
      return;
    }

    try {
      setLoading(true);
      await client.delete(`/projects/${projectId}`);
      alert("프로젝트가 삭제되었습니다.");
      window.location.href = "/projects"; // 프로젝트 목록으로 이동
    } catch (error: any) {
      console.error("프로젝트 삭제 실패:", error);
      alert(error.response?.data?.message || "프로젝트 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
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
              onChange={handleChange}
              fullWidth
              required
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
              onClick={handleDelete}
              disabled={loading}
            >
              프로젝트 삭제
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
    </Dialog>
  );
};

export default ProjectSettingsDialog;
