import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 일부 라이브러리가 `global` 전역을 기대할 수 있어, `globalThis`로 치환
  define: {
    global: "globalThis",
  },
  plugins: [react()],
})
