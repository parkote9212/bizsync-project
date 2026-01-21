import { create } from "zustand";

// UI Store 인터페이스 (persist 미사용 - 세션 상태만 관리)
interface UIStore {
  sidebarOpen: boolean;
  dialogStates: Record<string, boolean>;
  loadingStates: Record<string, boolean>;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDialogOpen: (dialogId: string, open: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
}

// UI Store 생성 (persist 미사용 - UI 상태는 새로고침 시 초기화)
export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  dialogStates: {},
  loadingStates: {},

  // 사이드바 열림/닫힘 설정
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // 사이드바 토글
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // 다이얼로그 상태 설정
  setDialogOpen: (dialogId, open) =>
    set((state) => ({
      dialogStates: {
        ...state.dialogStates,
        [dialogId]: open,
      },
    })),

  // 로딩 상태 설정
  setLoading: (key, loading) =>
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: loading,
      },
    })),

  // 특정 로딩 상태 제거
  clearLoading: (key) =>
    set((state) => {
      const newLoadingStates = { ...state.loadingStates };
      delete newLoadingStates[key];
      return { loadingStates: newLoadingStates };
    }),

  // 모든 로딩 상태 초기화
  clearAllLoading: () => set({ loadingStates: {} }),
}));
