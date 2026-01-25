import { useState, useCallback } from "react";
import type { ToastState, ToastSeverity } from "../utils/toast";

/**
 * Toast 알림을 관리하는 커스텀 훅
 *
 * <p>저장 성공, 네트워크 오류 등 비침해적인 알림을 표시하기 위한 훅입니다.
 * Toast는 자동으로 사라지며 사용자 경험을 방해하지 않습니다.
 *
 * @example
 * ```tsx
 * const { showToast, toastState, closeToast } = useToast();
 *
 * const handleSave = async () => {
 *   try {
 *     await saveData();
 *     showToast("저장되었습니다.", "success");
 *   } catch (error) {
 *     showToast("저장에 실패했습니다.", "error");
 *   }
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleSave}>저장</Button>
 *     <Toast
 *       open={toastState.open}
 *       message={toastState.message}
 *       severity={toastState.severity}
 *       onClose={closeToast}
 *     />
 *   </>
 * );
 * ```
 *
 * @returns {Object} Toast 관련 함수와 상태
 * @returns {Function} showToast - Toast를 표시하는 함수
 * @returns {string} showToast.message - 표시할 메시지
 * @returns {ToastSeverity} showToast.severity - Toast 심각도 (success, error, warning, info)
 * @returns {ToastState} toastState - Toast 상태 객체
 * @returns {Function} closeToast - Toast를 닫는 함수
 */
export const useToast = () => {
  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = useCallback((message: string, severity: ToastSeverity = "success") => {
    setToastState({
      open: true,
      message,
      severity,
    });
  }, []);

  const closeToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    showToast,
    toastState,
    closeToast,
  };
};
