export interface User {
  userId: number;
  name: string;
  email: string;
  empNo?: string;
  department?: string;
  role: string;
  position?: string;
}

export interface DashboardSummary {
  inProgressTasks: number;
  pendingApprovals: number;
  remainingBudget: number;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  daysLeft: number;
}

export interface Notice {
  id: number;
  title: string;
  date: string;
}

export interface NavigationMenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}
