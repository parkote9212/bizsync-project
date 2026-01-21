// 사용자 정보
export interface User {
  userId: number;
  name: string;
  email: string;
  empNo?: string;
  department?: string;
  role: string;
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
