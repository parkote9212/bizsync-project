import type { UserSearchResult } from "./user";

// 결재 상태
export const ApprovalStatus = {
  TEMP: "TEMP",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];

// 결재 유형
export const ApprovalType = {
  LEAVE: "LEAVE",
  EXPENSE: "EXPENSE",
  WORK: "WORK",
} as const;

export type ApprovalType = typeof ApprovalType[keyof typeof ApprovalType];

// 결재 요약 정보
export interface ApprovalSummary {
  documentId: number;
  title: string;
  drafterName: string;
  docStatus: ApprovalStatus;
  createdAt: string;
}

// 결재선 정보
export interface ApprovalLine {
  sequence: number;
  approverId: number;
  approverName: string;
  status: ApprovalStatus;
  comment?: string;
}

// 결재 상세 정보
export interface ApprovalDetail {
  documentId: number;
  title: string;
  content: string;
  type: ApprovalType;
  amount?: number;
  status: ApprovalStatus;
  drafterName: string;
  department: string;
  createdAt: string;
  approvalLines: ApprovalLine[];
}

// 결재 작성 폼 데이터
export interface ApprovalFormData {
  title: string;
  content: string;
  type: ApprovalType;
  amount: string;
  projectId: string;
  /** 결재선 (사용자 객체 배열) */
  approvers: UserSearchResult[];
}

// 결재 처리 요청 데이터
export interface ApprovalProcessRequest {
  status: ApprovalStatus;
  comment?: string;
}

// 결재 생성 요청 데이터
export interface ApprovalCreateRequest {
  projectId?: number;
  type: ApprovalType;
  amount?: number;
  title: string;
  content: string;
  approverIds: number[];
}

