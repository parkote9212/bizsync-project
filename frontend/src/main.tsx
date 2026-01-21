import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { useThemeStore } from "./stores/themeStore";

// 테마 래퍼 컴포넌트
function ThemeWrapper() {
  // mode를 직접 구독하여 변경사항 감지 및 리렌더링
  const mode = useThemeStore((state) => state.mode);

  // mode 값에 따라 실제 테마 모드 결정 (system일 경우 OS 설정 확인)
  let resolvedMode: "light" | "dark" = mode === "dark" ? "dark" : "light";
  if (mode === "system") {
    resolvedMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  const theme = createTheme({
    palette: {
      mode: resolvedMode,
      ...(resolvedMode === "light"
        ? {
          // 라이트 모드 색상
          primary: {
            main: "#1976d2",
            light: "#e3f2fd",
          },
          background: {
            default: "#f5f5f5",
            paper: "#ffffff",
          },
        }
        : {
          // 다크 모드 색상
          primary: {
            main: "#90caf9",
            light: "#1e3a5f",
          },
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
        }),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeWrapper />
  </StrictMode>,
);
