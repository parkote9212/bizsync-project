import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "../types/kanban";

// Project Store 인터페이스
interface ProjectStore {
  projects: Project[];
  currentProjectId: number | null;
  isLoading: boolean;
  error: string | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (projectId: number | null) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: number, updates: Partial<Project>) => void;
  removeProject: (projectId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  /** 사용자 전환 시 이전 사용자 데이터 초기화 (로그아웃/로그인 시 호출) */
  reset: () => void;
}

// 초기 상태
const initialState = {
  projects: [] as Project[],
  currentProjectId: null as number | null,
  isLoading: false,
  error: null as string | null,
};

// Project Store 생성
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      ...initialState,

      // 프로젝트 목록 설정 (백엔드 API에서 받은 데이터)
      setProjects: (projects) => set({ projects, error: null }),

      // 현재 프로젝트 설정
      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),

      // 프로젝트 추가
      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      // 프로젝트 업데이트
      updateProject: (projectId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.projectId === projectId ? { ...p, ...updates } : p
          ),
        })),

      // 프로젝트 제거
      removeProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.projectId !== projectId),
          currentProjectId:
            state.currentProjectId === projectId ? null : state.currentProjectId,
        })),

      // 로딩 상태 설정
      setLoading: (isLoading) => set({ isLoading }),

      // 에러 설정
      setError: (error) => set({ error }),

      // 에러 초기화
      clearError: () => set({ error: null }),

      // 사용자 전환 시 초기화 (이전 사용자의 프로젝트 데이터 제거)
      reset: () => set(initialState),
    }),
    {
      name: "project-storage",
      // currentProjectId는 새로고침 시 초기화하지 않음 (선택적)
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
      }),
    }
  )
);
