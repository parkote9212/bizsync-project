import React from "react";
import { Snackbar, Alert } from "@mui/material";
import type { ToastSeverity } from "../utils/toast";

interface ToastProps {
  open: boolean;
  message: string;
  severity: ToastSeverity;
  onClose: () => void;
  autoHideDuration?: number;
}

/**
 * Toast 알림 컴포넌트
 *
 * <p>저장 성공, 네트워크 오류 등 비침해적인 알림을 표시하는 컴포넌트입니다.
 * 자동으로 사라지며 사용자 경험을 방해하지 않습니다.
 *
 * @component
 * @param {ToastProps} props - Toast 컴포넌트 props
 * @param {boolean} props.open - Toast 표시 여부
 * @param {string} props.message - 표시할 메시지
 * @param {ToastSeverity} props.severity - Toast 심각도 (success, error, warning, info)
 * @param {Function} props.onClose - Toast를 닫을 때 호출되는 함수
 * @param {number} [props.autoHideDuration=3000] - 자동으로 사라지는 시간 (밀리초)
 *
 * @example
 * ```tsx
 * const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
 *
 * const handleSave = async () => {
 *   try {
 *     await saveData();
 *     setToast({ open: true, message: "저장되었습니다.", severity: "success" });
 *   } catch (error) {
 *     setToast({ open: true, message: "저장에 실패했습니다.", severity: "error" });
 *   }
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleSave}>저장</Button>
 *     <Toast
 *       open={toast.open}
 *       message={toast.message}
 *       severity={toast.severity}
 *       onClose={() => setToast({ ...toast, open: false })}
 *     />
 *   </>
 * );
 * ```
 */
const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 3000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
