import client from "./client";
import type {
  ApprovalSummary,
  ApprovalDetail,
  ApprovalCreateRequest,
  ApprovalProcessRequest,
  PageResponse,
} from "../types/approval";

/**
 * 결재 관련 API
 *
 * <p>결재 문서 생성, 조회, 처리 등의 결재 관련 API를 제공합니다.
 */
export const approvalApi = {
  /**
   * 사용자가 기안한 결재 문서 목록을 조회합니다.
   *
   * @param {number} [page=0] - 페이지 번호 (0부터 시작)
   * @param {number} [size=20] - 페이지 크기
   * @returns {Promise<PageResponse<ApprovalSummary>>} 기안한 결재 문서 목록 (페이징)
   * @throws {Error} API 호출 실패 시 에러 발생
   */
  getMyDrafts: async (page: number = 0, size: number = 20): Promise<PageResponse<ApprovalSummary>> => {
    const response = await client.get<PageResponse<ApprovalSummary>>("/approvals/my-drafts", {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * 사용자에게 대기 중인 결재 목록을 조회합니다.
   *
   * @param {number} [page=0] - 페이지 번호 (0부터 시작)
   * @param {number} [size=20] - 페이지 크기
   * @returns {Promise<PageResponse<ApprovalSummary>>} 대기 중인 결재 목록 (페이징)
   * @throws {Error} API 호출 실패 시 에러 발생
   */
  getMyPending: async (page: number = 0, size: number = 20): Promise<PageResponse<ApprovalSummary>> => {
    const response = await client.get<PageResponse<ApprovalSummary>>("/approvals/my-pending", {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * 사용자가 처리한 결재 목록을 조회합니다 (승인/반려 완료).
   *
   * @param {number} [page=0] - 페이지 번호 (0부터 시작)
   * @param {number} [size=20] - 페이지 크기
   * @returns {Promise<PageResponse<ApprovalSummary>>} 처리 완료된 결재 목록 (페이징)
   * @throws {Error} API 호출 실패 시 에러 발생
   */
  getMyCompleted: async (page: number = 0, size: number = 20): Promise<PageResponse<ApprovalSummary>> => {
    const response = await client.get<PageResponse<ApprovalSummary>>("/approvals/my-completed", {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * 결재 문서 상세 정보를 조회합니다.
   *
   * <p>기안자 또는 결재자만 조회할 수 있습니다.
   *
   * @param {number} documentId - 조회할 결재 문서 ID
   * @returns {Promise<ApprovalDetail>} 결재 상세 정보
   * @throws {Error} API 호출 실패 또는 권한 없음 시 에러 발생
   */
  getApprovalDetail: async (documentId: number): Promise<ApprovalDetail> => {
    const response = await client.get<ApprovalDetail>(`/approvals/${documentId}`);
    return response.data;
  },

  /**
   * 결재 문서를 생성합니다.
   *
   * <p>결재 문서를 생성하고 결재선을 설정합니다.
   *
   * @param {ApprovalCreateRequest} data - 결재 생성 요청 데이터
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패 시 에러 발생
   */
  createApproval: async (data: ApprovalCreateRequest): Promise<void> => {
    await client.post("/approvals", data);
  },

  /**
   * 결재를 승인하거나 반려 처리합니다.
   *
   * <p>이전 결재자가 모두 승인한 경우에만 처리할 수 있으며,
   * 모든 결재자가 승인하면 문서가 최종 승인됩니다.
   *
   * @param {number} documentId - 결재 문서 ID
   * @param {ApprovalProcessRequest} data - 결재 처리 요청 데이터 (승인/반려 상태 및 코멘트)
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패 또는 권한 없음 시 에러 발생
   */
  processApproval: async (documentId: number, data: ApprovalProcessRequest): Promise<void> => {
    await client.post(`/approvals/${documentId}/process`, data);
  },

  /**
   * 결재 문서를 취소합니다.
   *
   * <p>기안자만 취소할 수 있으며, 이미 승인되거나 반려된 결재는 취소할 수 없습니다.
   *
   * @param {number} documentId - 취소할 결재 문서 ID
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패 또는 권한 없음 시 에러 발생
   */
  cancelApproval: async (documentId: number): Promise<void> => {
    await client.post(`/approvals/${documentId}/cancel`);
  },
};
