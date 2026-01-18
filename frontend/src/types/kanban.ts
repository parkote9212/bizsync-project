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
}

export interface BoardData {
  projectId: number;
  name: string;
  columns: KanbanColumn[];
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
