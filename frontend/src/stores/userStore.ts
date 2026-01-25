import { create } from "zustand";
import { persist } from "zustand/middleware";

// 사용자 정보 타입
export interface UserInfo {
  userId: number | null;
  name: string | null;
  email: string | null;
  role: string | null;
  position: string | null;
  department: string | null;
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
  position: null,
  department: null,
};

// User Store 생성 (persist 미들웨어로 localStorage 동기화)
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: initialUser,
      setUser: (userData) =>
        set((state) => ({
          user: { 
            ...state.user, 
            ...userData,
            // userId를 명시적으로 number로 변환
            userId: userData.userId !== undefined 
              ? (typeof userData.userId === 'number' ? userData.userId : Number(userData.userId))
              : state.user.userId
          },
        })),
      clearUser: () => set({ user: initialUser }),
    }),
    {
      name: "user-storage", // localStorage 키 이름
      // localStorage에서 복원 시 userId를 number로 변환
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        if (parsed?.state?.user?.userId !== undefined && parsed?.state?.user?.userId !== null) {
          parsed.state.user.userId = Number(parsed.state.user.userId);
        }
        return parsed;
      },
    }
  )
);
