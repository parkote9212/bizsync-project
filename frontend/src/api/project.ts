import client from "./client";
import type { Project } from "../types/kanban";

/**
 * 프로젝트 관련 API
 *
 * <p>프로젝트 생성, 수정, 취소, 조회 등의 프로젝트 관련 API를 제공합니다.
 */
export const projectApi = {
  /**
   * 사용자가 참여한 프로젝트 목록을 조회합니다.
   *
   * @returns {Promise<Project[]>} 프로젝트 목록
   * @throws {Error} API 호출 실패 시 에러 발생
   */
  getProjects: async (): Promise<Project[]> => {
    const response = await client.get<Project[]>("/projects");
    return response.data;
  },

  /**
   * 프로젝트 칸반 보드 정보를 조회합니다.
   *
   * <p>프로젝트 멤버만 조회할 수 있으며, 프로젝트 정보, 컬럼, 업무가 포함됩니다.
   *
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<any>} 프로젝트 보드 정보
   * @throws {Error} API 호출 실패 또는 권한 없음 시 에러 발생
   */
  getProjectBoard: async (projectId: string): Promise<any> => {
    const response = await client.get(`/projects/${projectId}/board`);
    return response.data;
  },

  /**
   * 새로운 프로젝트를 생성합니다.
   *
   * <p>프로젝트 생성자는 자동으로 프로젝트 리더(PL)로 등록됩니다.
   *
   * @param {Object} data - 프로젝트 생성 요청 데이터
   * @param {string} data.name - 프로젝트 이름
   * @param {string} [data.description] - 프로젝트 설명
   * @param {string} data.startDate - 프로젝트 시작일 (YYYY-MM-DD)
   * @param {string} data.endDate - 프로젝트 종료일 (YYYY-MM-DD)
   * @param {number} [data.totalBudget] - 프로젝트 예산
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패 시 에러 발생
   */
  createProject: async (data: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    totalBudget?: number;
  }): Promise<void> => {
    await client.post("/projects", data);
  },

  /**
   * 프로젝트 정보를 수정합니다.
   *
   * <p>프로젝트 리더만 수정할 수 있습니다.
   *
   * @param {string} projectId - 프로젝트 ID
   * @param {Object} data - 프로젝트 수정 요청 데이터
   * @param {string} data.name - 프로젝트 이름
   * @param {string} [data.description] - 프로젝트 설명
   * @param {string} data.startDate - 프로젝트 시작일 (YYYY-MM-DD)
   * @param {string} data.endDate - 프로젝트 종료일 (YYYY-MM-DD)
   * @param {number} [data.totalBudget] - 프로젝트 예산
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패 또는 권한 없음 시 에러 발생
   */
  updateProject: async (projectId: string, data: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    totalBudget?: number;
  }): Promise<void> => {
    await client.put(`/projects/${projectId}`, data);
  },

  /**
   * 기획중인 프로젝트를 진행중 상태로 변경합니다.
   *
   * <p>프로젝트 리더만 시작할 수 있습니다.
   *
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패 또는 권한 없음 시 에러 발생
   */
  startProject: async (projectId: string): Promise<void> => {
    await client.patch(`/projects/${projectId}/start`);
  },

  /**
   * 프로젝트를 취소합니다 (소프트 삭제).
   *
   * <p>프로젝트 리더만 취소할 수 있으며, 프로젝트 상태를 CANCELLED로 변경합니다.
   * 관련 데이터는 유지되며, 통계에 반영됩니다.
   *
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패 또는 권한 없음 시 에러 발생
   */
  deleteProject: async (projectId: string): Promise<void> => {
    await client.delete(`/projects/${projectId}`);
  },

  /**
   * 프로젝트 멤버 목록을 조회합니다.
   *
   * <p>프로젝트 멤버만 조회할 수 있습니다.
   *
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<any[]>} 프로젝트 멤버 목록
   * @throws {Error} API 호출 실패 또는 권한 없음 시 에러 발생
   */
  getProjectMembers: async (projectId: string): Promise<any[]> => {
    const response = await client.get(`/projects/${projectId}/members`);
    return response.data;
  },

  /**
   * 프로젝트에 멤버를 초대합니다.
   *
   * <p>프로젝트 리더만 초대할 수 있으며, 이미 멤버인 경우 예외가 발생합니다.
   *
   * @param {string} projectId - 프로젝트 ID
   * @param {string} email - 초대할 사용자 이메일
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패, 권한 없음, 또는 중복 멤버 시 에러 발생
   */
  inviteMember: async (projectId: string, email: string): Promise<void> => {
    await client.post(`/projects/${projectId}/invite`, { email });
  },

  /**
   * 프로젝트 멤버의 권한을 변경합니다.
   *
   * <p>프로젝트 리더만 변경할 수 있으며, 자기 자신의 권한은 변경할 수 없습니다.
   *
   * @param {string} projectId - 프로젝트 ID
   * @param {number} memberId - 변경할 멤버 ID
   * @param {"PL"|"MEMBER"} role - 새로운 권한 (PL: 프로젝트 리더, MEMBER: 일반 멤버)
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패, 권한 없음, 또는 자기 자신 변경 시도 시 에러 발생
   */
  updateMemberRole: async (projectId: string, memberId: number, role: "PL" | "MEMBER"): Promise<void> => {
    await client.patch(`/projects/${projectId}/members/${memberId}/role`, { role });
  },

  /**
   * 프로젝트에서 멤버를 제거합니다.
   *
   * <p>프로젝트 리더만 제거할 수 있으며, 자기 자신은 제거할 수 없습니다.
   *
   * @param {string} projectId - 프로젝트 ID
   * @param {number} memberId - 제거할 멤버 ID
   * @returns {Promise<void>} 성공 시 void
   * @throws {Error} API 호출 실패, 권한 없음, 또는 자기 자신 제거 시도 시 에러 발생
   */
  removeMember: async (projectId: string, memberId: number): Promise<void> => {
    await client.delete(`/projects/${projectId}/members/${memberId}`);
  },
};
