import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import Toast from "./Toast";
import { createToastState, closeToast, type ToastState } from "../utils/toast";

/**
 * 컬럼 생성 다이얼로그 Props
 */
interface ColumnCreateDialogProps {
  /** 다이얼로그 열림/닫힘 상태 */
  open: boolean;
  /** 다이얼로그 닫기 콜백 */
  onClose: () => void;
  /** 컬럼 생성 제출 콜백 */
  onSubmit: (data: { name: string; description?: string; columnType?: string }) => void;
}

/**
 * 컬럼 생성 다이얼로그 컴포넌트
 *
 * <p>칸반 보드에 새로운 컬럼을 생성하는 다이얼로그입니다.
 * 컬럼명, 설명, 컬럼 타입(TODO, IN_PROGRESS, DONE)을 입력할 수 있습니다.
 *
 * @component
 * @param {ColumnCreateDialogProps} props - 컴포넌트 props
 * @returns {JSX.Element} 컬럼 생성 다이얼로그
 */
const ColumnCreateDialog: React.FC<ColumnCreateDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    columnType: "",
  });
  const [nameError, setNameError] = useState("");
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setNameError("컬럼명은 필수입니다.");
      return;
    }

    setNameError("");
    // 빈 값은 전송하지 않음
    const data: any = { name: form.name };
    if (form.description) data.description = form.description;
    if (form.columnType) data.columnType = form.columnType;

    onSubmit(data);
    setForm({ name: "", description: "", columnType: "" });
    setToast(createToastState("컬럼이 생성되었습니다.", "success"));
    onClose();
  };

  const handleClose = () => {
    setForm({ name: "", description: "", columnType: "" });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">새 컬럼 생성</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="컬럼명"
            name="name"
            value={form.name}
            onChange={(e) => {
              handleChange(e);
              if (nameError) setNameError("");
            }}
            fullWidth
            required
            autoFocus
            placeholder="예: 할 일, 진행 중, 완료"
            error={!!nameError}
            helperText={nameError}
          />
          <TextField
            label="설명"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            placeholder="이 컬럼에 대한 설명을 입력하세요 (선택)"
          />
          <FormControl fullWidth>
            <InputLabel>상태</InputLabel>
            <Select
              name="columnType"
              value={form.columnType}
              onChange={handleChange}
              label="상태"
            >
              <MenuItem value="">자동 판별</MenuItem>
              <MenuItem value="TODO">할 일 (TODO)</MenuItem>
              <MenuItem value="IN_PROGRESS">진행 중 (IN_PROGRESS)</MenuItem>
              <MenuItem value="DONE">완료 (DONE)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
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

export default ColumnCreateDialog;
