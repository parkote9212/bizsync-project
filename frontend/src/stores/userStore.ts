import { create } from "zustand";
import { persist } from "zustand/middleware";

// 사용자 정보 타입
export interface UserInfo {
  userId: number | null;
  name: string | null;
  email: string | null;
  role: string | null;
}

// User Store 인터페이스
interface UserStore {
  user: UserInfo;
  setUser: (user: Partial<UserInfo>) => void;
  clearUser: () => void;
}

// 초기 상태
const initialUser: UserInfo = {
  userId: null,
  name: null,
  email: null,
  role: null,
};

// User Store 생성 (persist 미들웨어로 localStorage 동기화)
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: initialUser,
      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
      clearUser: () => set({ user: initialUser }),
    }),
    {
      name: "user-storage", // localStorage 키 이름
    }
  )
);
