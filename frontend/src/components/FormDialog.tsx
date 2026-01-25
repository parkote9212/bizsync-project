import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from "@mui/material";

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

/**
 * 재사용 가능한 폼 다이얼로그 컴포넌트
 *
 * <p>폼 입력을 위한 다이얼로그 컴포넌트입니다.
 * 제목, 내용, 확인/취소 버튼을 포함하며, 로딩 상태를 지원합니다.
 *
 * @component
 * @param {FormDialogProps} props - FormDialog 컴포넌트 props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {string} props.title - 다이얼로그 제목
 * @param {Function} props.onClose - 다이얼로그를 닫을 때 호출되는 함수
 * @param {Function} [props.onSubmit] - 확인 버튼 클릭 시 실행할 함수
 * @param {string} [props.submitText="확인"] - 확인 버튼 텍스트
 * @param {string} [props.cancelText="취소"] - 취소 버튼 텍스트
 * @param {boolean} [props.loading=false] - 로딩 상태
 * @param {ReactNode} props.children - 다이얼로그 내용
 * @param {"xs"|"sm"|"md"|"lg"|"xl"} [props.maxWidth="sm"] - 다이얼로그 최대 너비
 * @param {boolean} [props.fullWidth=true] - 전체 너비 사용 여부
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * return (
 *   <FormDialog
 *     open={open}
 *     title="프로젝트 생성"
 *     onClose={() => setOpen(false)}
 *     onSubmit={async () => {
 *       await createProject();
 *       setOpen(false);
 *     }}
 *     submitText="생성하기"
 *     loading={isLoading}
 *   >
 *     <TextField label="프로젝트 이름" />
 *     <TextField label="설명" />
 *   </FormDialog>
 * );
 * ```
 */
export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  submitText = "확인",
  cancelText = "취소",
  loading = false,
  children,
  maxWidth = "sm",
  fullWidth = true,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle fontWeight="bold">{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {children}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {cancelText}
        </Button>
        {onSubmit && (
          <Button onClick={onSubmit} variant="contained" color="primary" disabled={loading}>
            {submitText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
