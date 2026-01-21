// src/types/kanban.ts

export interface Task {
  taskId: number;
  title: string;
  content?: string; // description -> content 로 통일 권장
  workerName?: string;
  workerId?: number | null;
  sequence: number;
  deadline?: string;
}

export interface KanbanColumn {
  columnId: number;
  name: string;
  sequence: number;
  tasks: Task[];
  columnType?: "TODO" | "IN_PROGRESS" | "DONE"; // 컬럼 타입
}

export interface BoardData {
  projectId: number;
  name: string;
  columns: KanbanColumn[];
  status?: string; // 프로젝트 상태
  myRole?: string; // 현재 사용자의 프로젝트 내 역할 (PL, MEMBER)
}

export interface Project {
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface TaskCreateData {
  title: string;
  content: string;
  deadline: string;
  workerId: number | null;
}
