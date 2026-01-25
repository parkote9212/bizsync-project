import { useState, useCallback } from "react";

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: "warning" | "error";
  onConfirm: () => void;
}

/**
 * 확인 다이얼로그 상태 인터페이스
 *
 * @interface ConfirmDialogState
 * @property {boolean} open - 다이얼로그 열림 상태
 * @property {string} title - 다이얼로그 제목
 * @property {string} message - 다이얼로그 메시지
 * @property {string} [confirmText="확인"] - 확인 버튼 텍스트
 * @property {string} [cancelText="취소"] - 취소 버튼 텍스트
 * @property {"warning"|"error"} [severity="warning"] - 다이얼로그 심각도
 * @property {Function} onConfirm - 확인 시 실행할 함수
 */
interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: "warning" | "error";
  onConfirm: () => void;
}

/**
 * 확인 다이얼로그를 관리하는 커스텀 훅
 *
 * <p>삭제 등 중요한 동작에 사용자 확인을 받기 위한 다이얼로그를 관리합니다.
 * 사용자가 확인 또는 취소를 선택할 수 있는 모달 다이얼로그를 제공합니다.
 *
 * @example
 * ```tsx
 * const { showConfirm, confirmDialogState, closeConfirm } = useConfirmDialog();
 *
 * const handleDelete = () => {
 *   showConfirm(
 *     "삭제 확인",
 *     "정말 이 항목을 삭제하시겠습니까?",
 *     async () => {
 *       await deleteItem();
 *       closeConfirm();
 *     },
 *     {
 *       confirmText: "삭제",
 *       cancelText: "취소",
 *       severity: "error"
 *     }
 *   );
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleDelete}>삭제</Button>
 *     <ConfirmDialog
 *       open={confirmDialogState.open}
 *       title={confirmDialogState.title}
 *       message={confirmDialogState.message}
 *       confirmText={confirmDialogState.confirmText}
 *       cancelText={confirmDialogState.cancelText}
 *       severity={confirmDialogState.severity}
 *       onConfirm={confirmDialogState.onConfirm}
 *       onCancel={closeConfirm}
 *     />
 *   </>
 * );
 * ```
 *
 * @returns {Object} 확인 다이얼로그 관련 함수와 상태
 * @returns {Function} showConfirm - 확인 다이얼로그를 표시하는 함수
 * @returns {string} showConfirm.title - 다이얼로그 제목
 * @returns {string} showConfirm.message - 다이얼로그 메시지
 * @returns {Function} showConfirm.onConfirm - 확인 시 실행할 함수
 * @returns {Object} [showConfirm.options] - 추가 옵션 (confirmText, cancelText, severity)
 * @returns {ConfirmDialogState} confirmDialogState - 확인 다이얼로그 상태 객체
 * @returns {Function} closeConfirm - 확인 다이얼로그를 닫는 함수
 */
export const useConfirmDialog = () => {
  const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    message: "",
    confirmText: "확인",
    cancelText: "취소",
    severity: "warning",
    onConfirm: () => {},
  });

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      severity?: "warning" | "error";
    }
  ) => {
    setConfirmDialogState({
      open: true,
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText || "확인",
      cancelText: options?.cancelText || "취소",
      severity: options?.severity || "warning",
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    showConfirm,
    confirmDialogState,
    closeConfirm,
  };
};
