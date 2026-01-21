import { create } from "zustand";
import type {
  ApprovalSummary,
  ApprovalStatus,
  ApprovalType,
  PageResponse,
} from "../types/approval";

// Approval Store 인터페이스
interface ApprovalStore {
  // 내 기안함 데이터
  myDrafts: ApprovalSummary[];
  myDraftsPage: PageResponse<ApprovalSummary> | null;
  // 내 결재 대기함 데이터
  myPending: ApprovalSummary[];
  myPendingPage: PageResponse<ApprovalSummary> | null;
  // 필터 조건
  draftFilters: {
    status?: ApprovalStatus[];
    type?: ApprovalType[];
  };
  pendingFilters: {
    status?: ApprovalStatus[];
    type?: ApprovalType[];
  };
  // 로딩 상태
  isLoadingDrafts: boolean;
  isLoadingPending: boolean;
  // 에러 상태
  error: string | null;
  // Actions
  setMyDrafts: (
    drafts: ApprovalSummary[],
    page?: PageResponse<ApprovalSummary>
  ) => void;
  setMyPending: (
    pending: ApprovalSummary[],
    page?: PageResponse<ApprovalSummary>
  ) => void;
  addDraft: (draft: ApprovalSummary) => void;
  updateDraft: (documentId: number, updates: Partial<ApprovalSummary>) => void;
  removeDraft: (documentId: number) => void;
  updatePending: (
    documentId: number,
    updates: Partial<ApprovalSummary>
  ) => void;
  removePending: (documentId: number) => void;
  setDraftFilters: (filters: { status?: ApprovalStatus[]; type?: ApprovalType[] }) => void;
  setPendingFilters: (filters: { status?: ApprovalStatus[]; type?: ApprovalType[] }) => void;
  setLoadingDrafts: (loading: boolean) => void;
  setLoadingPending: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetFilters: () => void;
  // TODO: 백엔드 API 호출 함수 (필요시 추가)
  // fetchMyDrafts: (page?: number) => Promise<void>;
  // fetchMyPending: (page?: number) => Promise<void>;
}

// 초기 상태
const initialState = {
  myDrafts: [] as ApprovalSummary[],
  myDraftsPage: null as PageResponse<ApprovalSummary> | null,
  myPending: [] as ApprovalSummary[],
  myPendingPage: null as PageResponse<ApprovalSummary> | null,
  draftFilters: {} as { status?: ApprovalStatus[]; type?: ApprovalType[] },
  pendingFilters: {} as { status?: ApprovalStatus[]; type?: ApprovalType[] },
  isLoadingDrafts: false,
  isLoadingPending: false,
  error: null as string | null,
};

// Approval Store 생성 (persist 미사용 - 결재 데이터는 API에서 매번 조회)
export const useApprovalStore = create<ApprovalStore>((set) => ({
  ...initialState,

  // 내 기안함 설정 (백엔드 API에서 받은 데이터)
  setMyDrafts: (drafts, page) =>
    set({ myDrafts: drafts, myDraftsPage: page || null, error: null }),

  // 내 결재 대기함 설정 (백엔드 API에서 받은 데이터)
  setMyPending: (pending, page) =>
    set({ myPending: pending, myPendingPage: page || null, error: null }),

  // 기안 추가
  addDraft: (draft) =>
    set((state) => ({
      myDrafts: [draft, ...state.myDrafts],
    })),

  // 기안 업데이트
  updateDraft: (documentId, updates) =>
    set((state) => ({
      myDrafts: state.myDrafts.map((draft) =>
        draft.documentId === documentId ? { ...draft, ...updates } : draft
      ),
    })),

  // 기안 제거
  removeDraft: (documentId) =>
    set((state) => ({
      myDrafts: state.myDrafts.filter((draft) => draft.documentId !== documentId),
    })),

  // 결재 대기 업데이트
  updatePending: (documentId, updates) =>
    set((state) => ({
      myPending: state.myPending.map((pending) =>
        pending.documentId === documentId
          ? { ...pending, ...updates }
          : pending
      ),
    })),

  // 결재 대기 제거
  removePending: (documentId) =>
    set((state) => ({
      myPending: state.myPending.filter(
        (pending) => pending.documentId !== documentId
      ),
    })),

  // 기안함 필터 설정
  setDraftFilters: (filters) =>
    set((state) => ({
      draftFilters: { ...state.draftFilters, ...filters },
    })),

  // 결재 대기함 필터 설정
  setPendingFilters: (filters) =>
    set((state) => ({
      pendingFilters: { ...state.pendingFilters, ...filters },
    })),

  // 기안함 로딩 상태 설정
  setLoadingDrafts: (isLoadingDrafts) => set({ isLoadingDrafts }),

  // 결재 대기함 로딩 상태 설정
  setLoadingPending: (isLoadingPending) => set({ isLoadingPending }),

  // 에러 설정
  setError: (error) => set({ error }),

  // 에러 초기화
  clearError: () => set({ error: null }),

  // 필터 초기화
  resetFilters: () =>
    set({
      draftFilters: {},
      pendingFilters: {},
    }),
}));
