import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: "warning" | "error";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 확인 다이얼로그 컴포넌트
 *
 * <p>삭제 등 중요한 동작에 사용자 확인을 받기 위한 다이얼로그 컴포넌트입니다.
 * 사용자가 확인 또는 취소를 선택할 수 있는 모달 다이얼로그를 제공합니다.
 *
 * @component
 * @param {ConfirmDialogProps} props - ConfirmDialog 컴포넌트 props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {string} props.title - 다이얼로그 제목
 * @param {string} props.message - 다이얼로그 메시지
 * @param {string} [props.confirmText="확인"] - 확인 버튼 텍스트
 * @param {string} [props.cancelText="취소"] - 취소 버튼 텍스트
 * @param {"warning"|"error"} [props.severity="warning"] - 다이얼로그 심각도
 * @param {Function} props.onConfirm - 확인 버튼 클릭 시 실행할 함수
 * @param {Function} props.onCancel - 취소 버튼 클릭 시 실행할 함수
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * const handleDelete = () => {
 *   setOpen(true);
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleDelete}>삭제</Button>
 *     <ConfirmDialog
 *       open={open}
 *       title="삭제 확인"
 *       message="정말 이 항목을 삭제하시겠습니까?"
 *       confirmText="삭제"
 *       cancelText="취소"
 *       severity="error"
 *       onConfirm={async () => {
 *         await deleteItem();
 *         setOpen(false);
 *       }}
 *       onCancel={() => setOpen(false)}
 *     />
 *   </>
 * );
 * ```
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  severity = "warning",
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Alert severity={severity} sx={{ mb: 2 }}>
          <Box component="span" sx={{ whiteSpace: "pre-line" }}>
            {message}
          </Box>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={severity === "error" ? "error" : "primary"}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
