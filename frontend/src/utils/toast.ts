import type { Dispatch, SetStateAction } from "react";

/**
 * Toast 알림 유틸리티
 *
 * <p>상황별로 적절한 피드백을 제공합니다:
 * - 저장 성공: Toast (비침해적, 자동 사라짐)
 * - 네트워크 오류: Toast (에러) (즉시 알림, 자동 사라짐)
 */

/**
 * Toast 심각도 타입
 *
 * @typedef {"success"|"error"|"warning"|"info"} ToastSeverity
 */
export type ToastSeverity = "success" | "error" | "warning" | "info";

/**
 * Toast 상태 인터페이스
 *
 * @interface ToastState
 * @property {boolean} open - Toast 표시 여부
 * @property {string} message - 표시할 메시지
 * @property {ToastSeverity} severity - Toast 심각도
 */
export interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

/**
 * Toast 상태를 생성하는 유틸리티 함수
 *
 * @param {string} message - 표시할 메시지
 * @param {ToastSeverity} [severity="success"] - Toast 심각도
 * @returns {ToastState} Toast 상태 객체
 *
 * @example
 * ```ts
 * const toastState = createToastState("저장되었습니다.", "success");
 * // { open: true, message: "저장되었습니다.", severity: "success" }
 * ```
 */
export const createToastState = (
  message: string,
  severity: ToastSeverity = "success"
): ToastState => ({
  open: true,
  message,
  severity,
});

/**
 * Toast를 닫는 유틸리티 함수
 *
 * @param {Dispatch<SetStateAction<ToastState>>} setToast - Toast 상태를 설정하는 함수
 *
 * @example
 * ```ts
 * const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });
 * closeToast(setToast); // Toast를 닫음
 * ```
 */
export const closeToast = (setToast: Dispatch<SetStateAction<ToastState>>) => {
  setToast((prev) => ({ ...prev, open: false }));
};
