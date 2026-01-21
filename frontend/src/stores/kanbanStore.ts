import { create } from "zustand";
import type { BoardData, Task } from "../types/kanban";

// Kanban Store 인터페이스
interface KanbanStore {
  currentBoard: BoardData | null;
  filterStatus: string[]; // 필터링할 상태 목록
  sortBy: "deadline" | "sequence" | "title" | null;
  sortOrder: "asc" | "desc";
  isLoading: boolean;
  error: string | null;
  setBoard: (board: BoardData | null) => void;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  addTask: (columnId: number, task: Task) => void;
  removeTask: (taskId: number) => void;
  setFilterStatus: (status: string[]) => void;
  setSortBy: (sortBy: "deadline" | "sequence" | "title" | null) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetFilters: () => void;
}

// 초기 상태
const initialState = {
  currentBoard: null as BoardData | null,
  filterStatus: [] as string[],
  sortBy: null as "deadline" | "sequence" | "title" | null,
  sortOrder: "asc" as "asc" | "desc",
  isLoading: false,
  error: null as string | null,
};

// Kanban Store 생성 (persist 미사용 - 보드 데이터는 API에서 매번 조회)
export const useKanbanStore = create<KanbanStore>((set) => ({
  ...initialState,

  // 보드 데이터 설정 (백엔드 API에서 받은 데이터)
  setBoard: (board) => set({ currentBoard: board, error: null }),

  // 작업 업데이트
  updateTask: (taskId, updates) =>
    set((state) => {
      if (!state.currentBoard) return state;
      
      const updatedColumns = state.currentBoard.columns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) =>
          task.taskId === taskId ? { ...task, ...updates } : task
        ),
      }));

      return {
        currentBoard: {
          ...state.currentBoard,
          columns: updatedColumns,
        },
      };
    }),

  // 작업 추가
  addTask: (columnId, task) =>
    set((state) => {
      if (!state.currentBoard) return state;

      const updatedColumns = state.currentBoard.columns.map((column) =>
        column.columnId === columnId
          ? { ...column, tasks: [...column.tasks, task] }
          : column
      );

      return {
        currentBoard: {
          ...state.currentBoard,
          columns: updatedColumns,
        },
      };
    }),

  // 작업 제거
  removeTask: (taskId) =>
    set((state) => {
      if (!state.currentBoard) return state;

      const updatedColumns = state.currentBoard.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.taskId !== taskId),
      }));

      return {
        currentBoard: {
          ...state.currentBoard,
          columns: updatedColumns,
        },
      };
    }),

  // 필터 상태 설정
  setFilterStatus: (filterStatus) => set({ filterStatus }),

  // 정렬 기준 설정
  setSortBy: (sortBy) => set({ sortBy }),

  // 정렬 순서 설정
  setSortOrder: (sortOrder) => set({ sortOrder }),

  // 로딩 상태 설정
  setLoading: (isLoading) => set({ isLoading }),

  // 에러 설정
  setError: (error) => set({ error }),

  // 에러 초기화
  clearError: () => set({ error: null }),

  // 필터 초기화
  resetFilters: () =>
    set({
      filterStatus: [],
      sortBy: null,
      sortOrder: "asc",
    }),
}));
