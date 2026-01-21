// 사용자 정보
export interface User {
  userId: number;
  name: string;
  email: string;
  empNo?: string;
  department?: string;
  role: string;
  position?: string;
}

// 대시보드 요약 데이터
export interface DashboardSummary {
  inProgressTasks: number;
  pendingApprovals: number;
  remainingBudget: number;
}

// 업무 정보
export interface Task {
  id: number;
  title: string;
  dueDate: string;
  daysLeft: number;
}

// 공지사항 정보
export interface Notice {
  id: number;
  title: string;
  date: string;
}

// 메뉴 아이템 타입 (MUI MenuItem과 충돌 방지를 위해 NavigationMenuItem로 명명)
export interface NavigationMenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

// 프로젝트 상태
export type ProjectStatus =
  | "PLANNING"      // 기획중
  | "IN_PROGRESS"   // 진행중
  | "COMPLETED"     // 완료
  | "ON_HOLD"       // 보류
  | "CANCELLED";    // 취소

// 업무 상태
export type TaskStatus =
  | "TODO"          // 할일
  | "IN_PROGRESS"   // 진행중
  | "COMPLETED";    // 완료
