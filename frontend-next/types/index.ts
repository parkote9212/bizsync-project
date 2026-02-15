/**
 * 공통 타입 정의
 */

// 사용자 상태
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

// 사용자 역할
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// OAuth2 제공자
export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  KAKAO = 'KAKAO',
}

// 사용자 정보
export interface User {
  userId: number;
  email: string;
  name: string;
  empNo?: string;
  department?: string;
  position?: string;
  phone?: string;
  status: UserStatus;
  role: UserRole;
  profileImageUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

// 프로젝트 멤버 역할
export enum ProjectMemberRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

// 프로젝트 상태
export enum ProjectStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  HOLD = 'HOLD',
}

// 프로젝트 정보
export interface Project {
  projectId: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  usedBudget?: number;
  createdAt: string;
}

// 업무(Task) 우선순위
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// 업무(Task) 정보
export interface Task {
  taskId: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  columnId: number;
  position: number;
  workerId?: number;
  workerName?: string;
  createdAt: string;
}

// 결재 유형
export enum ApprovalType {
  GENERAL = 'GENERAL',
  EXPENSE = 'EXPENSE',
  LEAVE = 'LEAVE',
}

// 결재 상태
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

// 결재 문서
export interface ApprovalDocument {
  documentId: number;
  drafter: User;
  title: string;
  type: ApprovalType;
  content: string;
  status: ApprovalStatus;
  projectId?: number;
  amount?: number;
  createdAt: string;
}

// 페이지네이션 응답
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// API 에러 응답
export interface ApiError {
  status: number;
  code: string;
  message: string;
  timestamp: string;
}
