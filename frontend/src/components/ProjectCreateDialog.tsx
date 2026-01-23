import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import client from "../api/client";

interface ProjectCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
}

const ProjectCreateDialog: React.FC<ProjectCreateDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    totalBudget: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "totalBudget" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      alert("프로젝트 이름과 기간은 필수입니다.");
      return;
    }

    try {
      await client.post("/projects", form);

      alert("프로젝트가 생성되었습니다.!");
      onCreate();
      onClose();

      setForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        totalBudget: 0,
      });
    } catch (error: unknown) {
      console.error("프로젝트 생성 실패", error);
      alert("생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">새 프로젝트 생성</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="프로젝트 이름"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="설명"
            name="description"
            value={form.description}
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
              value={form.startDate}
              onChange={handleChange}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="종료일"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <TextField
            label="예산 (원)"
            name="totalBudget"
            type="number"
            value={form.totalBudget}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          취소
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          생성하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ProjectCreateDialog;
