import { ApprovalStatus, ApprovalType } from "../types/approval";

/**
 * 결재 관련 유틸리티 함수
 */

/**
 * 날짜 문자열을 YYYY-MM-DD 형식으로 포맷팅합니다.
 *
 * @param {string} dateString - 포맷팅할 날짜 문자열
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 *
 * @example
 * ```ts
 * formatDate("2024-01-15T10:30:00Z"); // "2024-01-15"
 * ```
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

/**
 * 결재 상태에 따른 Chip 색상을 반환합니다.
 *
 * @param {ApprovalStatus} status - 결재 상태
 * @returns {"success"|"error"|"warning"|"default"} Chip 색상
 */
export const getStatusColor = (status: ApprovalStatus): "success" | "error" | "warning" | "default" => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return "success";
    case ApprovalStatus.REJECTED:
      return "error";
    case ApprovalStatus.PENDING:
      return "warning";
    case ApprovalStatus.CANCELLED:
      return "default";
    default:
      return "default";
  }
};

/**
 * 결재 상태에 따른 한글 라벨을 반환합니다.
 *
 * @param {ApprovalStatus} status - 결재 상태
 * @returns {string} 한글 상태 라벨
 */
export const getStatusLabel = (status: ApprovalStatus): string => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return "승인";
    case ApprovalStatus.REJECTED:
      return "반려";
    case ApprovalStatus.PENDING:
      return "진행중";
    case ApprovalStatus.TEMP:
      return "임시저장";
    case ApprovalStatus.CANCELLED:
      return "취소";
    default:
      return status;
  }
};

/**
 * 결재 유형에 따른 한글 라벨을 반환합니다.
 *
 * @param {string} type - 결재 유형
 * @returns {string} 한글 유형 라벨
 */
export const getTypeLabel = (type: string): string => {
  switch (type) {
    case ApprovalType.LEAVE:
      return "휴가";
    case ApprovalType.EXPENSE:
      return "비용";
    case ApprovalType.WORK:
      return "업무";
    default:
      return type;
  }
};

/**
 * 숫자 문자열을 천 단위 콤마가 포함된 형식으로 포맷팅합니다.
 *
 * @param {string} value - 포맷팅할 숫자 문자열
 * @returns {string} 천 단위 콤마가 포함된 문자열
 *
 * @example
 * ```ts
 * formatCurrency("1234567"); // "1,234,567"
 * ```
 */
export const formatCurrency = (value: string): string => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
