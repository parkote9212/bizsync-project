/**
 * 사용자 관련 공통 타입 정의
 */

// 사용자 검색 결과
export interface UserSearchResult {
  userId: number;
  name: string;
  email: string;
  department: string;
  position: string;
}

// 페이지네이션 응답
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
