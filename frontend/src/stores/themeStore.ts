import { create } from "zustand";
import { persist } from "zustand/middleware";

// 테마 모드 타입
export type ThemeMode = "light" | "dark" | "system";

// Theme Store 인터페이스
interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  getResolvedMode: () => "light" | "dark"; // system 모드의 경우 실제 적용될 모드
}

// Theme Store 생성
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: "light",

      // 테마 모드 설정
      setMode: (mode) => set({ mode }),

      // 라이트/다크 토글 (system 모드일 경우 light로 전환)
      toggleMode: () =>
        set((state) => {
          if (state.mode === "light") {
            return { mode: "dark" };
          } else if (state.mode === "dark") {
            return { mode: "light" };
          } else {
            // system 모드일 경우 다크 모드로 전환
            return { mode: "dark" };
          }
        }),

      // 실제 적용될 테마 모드 반환 (system 모드의 경우 시스템 설정 확인)
      getResolvedMode: () => {
        const { mode } = get();
        if (mode === "system") {
          // 시스템 다크 모드 감지
          if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ) {
            return "dark";
          }
          return "light";
        }
        return mode;
      },
    }),
    {
      name: "theme-storage",
    }
  )
);
