export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DELETED";

export type UserRole = "ADMIN" | "MANAGER" | "MEMBER";

export interface AdminUser {
  userId: number;
  email: string;
  name: string;
  empNo?: string;
  department?: string;
  role: UserRole;
  position?: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserStatistics {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  adminUsers: number;
  managerUsers: number;
  memberUsers: number;
}

export interface AdminDashboardStatistics {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  adminUsers: number;
  managerUsers: number;
  memberUsers: number;
  totalProjects: number;
  planningProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  cancelledProjects: number;
  totalTasks: number;
  totalApprovals: number;
}
