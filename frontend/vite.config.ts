import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 일부 레거시 라이브러리(예: sockjs-client)가 `global` 전역을 기대합니다.
  // Vite에서 빌드 타임에 `global`을 `globalThis`로 치환해 런타임 오류를 방지합니다.
  define: {
    global: 'globalThis'
  },
  plugins: [react()],
})
