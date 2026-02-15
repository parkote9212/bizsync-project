# BizSync v2 Frontend (Next.js 15)

기업 협업 플랫폼 BizSync의 프론트엔드 애플리케이션 (Next.js 15 기반)

## 기술 스택

- **Framework**: Next.js 15.1 (App Router + API Routes)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **HTTP Client**: Axios
- **Architecture**: BFF (Backend for Frontend) Pattern
- **Build Tool**: Turbopack

## 주요 기능

- 🔐 인증/인가 (JWT + OAuth2)
- 📊 프로젝트 관리 대시보드
- 📋 칸반 보드 (드래그 앤 드롭)
- ✅ 전자결재 시스템
- 💬 실시간 채팅 (WebSocket/STOMP)
- 🔔 실시간 알림
- 📈 활동 로그 및 통계

## 시작하기

### 설치

\`\`\`bash
npm install
\`\`\`

### 환경 변수 설정

\`.env.local\` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`env
BACKEND_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
\`\`\`

**중요**: `BACKEND_API_URL`은 서버사이드(Next.js API Routes)에서만 사용되며, 클라이언트는 `/api/*` 경로로 BFF를 통해 백엔드와 통신합니다.

### 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

### 빌드

\`\`\`bash
npm run build
npm start
\`\`\`

## 프로젝트 구조

\`\`\`
frontend-next/
├── app/                  # Next.js App Router
│   ├── (auth)/          # 인증 관련 페이지 (login, register)
│   ├── (dashboard)/     # 대시보드 레이아웃
│   ├── layout.tsx       # Root Layout
│   ├── page.tsx         # 홈페이지
│   └── globals.css      # 전역 스타일
├── components/          # 재사용 가능한 컴포넌트
├── hooks/               # Custom React Hooks
├── lib/                 # 유틸리티 라이브러리
│   └── api.ts          # Axios 클라이언트
├── types/               # TypeScript 타입 정의
└── public/              # 정적 파일
\`\`\`

## 개발 가이드

### 코딩 컨벤션

- **컴포넌트**: PascalCase (예: `UserProfile.tsx`)
- **파일명**: kebab-case (예: `user-profile.tsx`)
- **함수/변수**: camelCase (예: `getUserData`)
- **타입/인터페이스**: PascalCase (예: `User`, `ProjectResponse`)

### 커밋 메시지

```
feat(scope): 새 기능 추가
fix(scope): 버그 수정
refactor(scope): 리팩토링
chore(scope): 설정, 의존성
docs(scope): 문서
style(scope): 스타일링
```

## API 연동

백엔드 API 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.

\`\`\`bash
# Backend 서버 실행
cd ../backend
./gradlew bootRun
\`\`\`

## Phase 3-1 진행 상황

- ✅ Next.js 15 프로젝트 셋업
- ✅ Tailwind CSS 4 설정
- ✅ TypeScript 설정
- ✅ API 클라이언트 설정
- ✅ 기본 타입 정의
- 🚧 인증 페이지 구현 (진행 중)
- 🚧 대시보드 레이아웃 (진행 중)

## 라이선스

MIT
