import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import client from "../api/client";
import Toast from "./Toast";
import { createToastState, closeToast, type ToastState } from "../utils/toast";

interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
}

const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({ open, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (newPassword.length < 4) {
      newErrors.newPassword = "새 비밀번호는 최소 4자 이상이어야 합니다.";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      await client.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setToast(createToastState("비밀번호가 변경되었습니다.", "success"));
      handleClose();
    } catch (error: any) {
      console.error("비밀번호 변경 실패:", error);
      const errorMessage = error.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      setToast(createToastState(errorMessage, "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight="bold">비밀번호 변경</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="현재 비밀번호"
            type="password"
            fullWidth
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (errors.currentPassword) {
                setErrors({ ...errors, currentPassword: undefined });
              }
            }}
            autoFocus
            required
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
          />
          <TextField
            label="새 비밀번호"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) {
                setErrors({ ...errors, newPassword: undefined });
              }
            }}
            required
            error={!!errors.newPassword}
            helperText={errors.newPassword}
          />
          <TextField
            label="새 비밀번호 확인"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            required
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          변경
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

export default PasswordChangeDialog;
