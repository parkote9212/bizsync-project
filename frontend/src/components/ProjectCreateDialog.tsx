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
import Toast from "./Toast";
import { createToastState, closeToast, type ToastState } from "../utils/toast";

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
  const [errors, setErrors] = useState<{ name?: string; startDate?: string; endDate?: string }>({});
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "totalBudget" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    // 입력 검증
    const newErrors: { name?: string; startDate?: string; endDate?: string } = {};
    if (!form.name || form.name.trim() === "") {
      newErrors.name = "프로젝트 이름은 필수입니다.";
    }
    if (!form.startDate) {
      newErrors.startDate = "시작일은 필수입니다.";
    }
    if (!form.endDate) {
      newErrors.endDate = "종료일은 필수입니다.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await client.post("/projects", form);
      setToast(createToastState("프로젝트가 생성되었습니다.", "success"));
      onCreate();
      onClose();

      setForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        totalBudget: 0,
      });
    } catch (error: any) {
      console.error("프로젝트 생성 실패", error);
      const errorMessage = error.response?.data?.message || "생성 중 오류가 발생했습니다.";
      setToast(createToastState(errorMessage, "error"));
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
            error={!!errors.name}
            helperText={errors.name}
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
              error={!!errors.startDate}
              helperText={errors.startDate}
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
              error={!!errors.endDate}
              helperText={errors.endDate}
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
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => closeToast(setToast)}
      />
    </Dialog>
  );
};
export default ProjectCreateDialog;
