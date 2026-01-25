import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

interface ApprovalProcessDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

/**
 * 결재 반려 처리 다이얼로그 컴포넌트
 *
 * <p>결재를 반려할 때 반려 사유를 입력받는 다이얼로그입니다.
 *
 * @component
 * @param {ApprovalProcessDialogProps} props - ApprovalProcessDialog 컴포넌트 props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {Function} props.onClose - 다이얼로그를 닫을 때 호출되는 함수
 * @param {Function} props.onSubmit - 반려 사유 제출 시 호출되는 함수
 */
export const ApprovalProcessDialog: React.FC<ApprovalProcessDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [rejectReason, setRejectReason] = useState("");

  const handleSubmit = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    await onSubmit(rejectReason);
    setRejectReason("");
  };

  const handleClose = () => {
    setRejectReason("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>결재 반려</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          반려 사유를 입력해주세요.
        </Typography>
        <TextField
          fullWidth
          label="반려 사유"
          required
          multiline
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="반려 사유를 입력해주세요."
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleSubmit}
          disabled={!rejectReason.trim()}
        >
          반려
        </Button>
      </DialogActions>
    </Dialog>
  );
};
