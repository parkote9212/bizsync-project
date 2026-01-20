# BizSync Frontend

BizSync의 프론트엔드(React + TypeScript + Vite)입니다. 로그인 후 **프로젝트 목록**과 **프로젝트 칸반 보드**를 제공하며, 보드 변경 사항을 **WebSocket(STOMP)** 으로 실시간 반영합니다.

## 주요 기능

- **로그인**: `/login`에서 이메일/비밀번호로 로그인 → 토큰을 `localStorage`에 저장
- **인증 보호 라우팅**: 인증이 필요한 페이지(`/projects`, `/projects/:projectId`)는 `ProtectedRoute`로 보호
- **프로젝트 목록**: `/projects`에서 프로젝트 조회 및 “새 프로젝트” 생성 다이얼로그 제공
- **칸반 보드**: `/projects/:projectId`
  - Drag & Drop으로 업무 이동(낙관적 업데이트 적용)
  - 컬럼/업무 생성 다이얼로그
  - 팀원 초대 다이얼로그
  - WebSocket 구독으로 보드 갱신

## 기술 스택

- **React 19**, **TypeScript**, **Vite**
- **React Router DOM 7**
- **MUI(@mui/material, emotion)** UI
- **axios** (요청/응답 인터셉터)
- **@stomp/stompjs** (WebSocket 구독)
- **@hello-pangea/dnd** (Drag & Drop)

## 빠른 시작

### 요구 사항

- Node.js / npm (프로젝트의 `package-lock.json` 기준으로 설치 권장)
- 백엔드 서버 실행
  - REST API: `http://localhost:8080/api`
  - WebSocket: `ws://localhost:8080/ws`

### 설치 및 실행

```bash
npm install
npm run dev
```

- 기본 접속: `http://localhost:5173`
- 기본 라우팅: `/` 접속 시 `/login`으로 리다이렉트

### 빌드/프리뷰

```bash
npm run build
npm run preview
```

## 라우팅

- `/` → `/login`으로 리다이렉트
- `/login` 로그인 페이지
- `/projects` 프로젝트 목록 (인증 필요)
- `/projects/:projectId` 프로젝트 칸반 보드 (인증 필요)

라우팅 정의는 `src/App.tsx`에 있습니다.

## 인증/토큰

- 로그인 성공 시 `accessToken`, `refreshToken`을 `localStorage`에 저장합니다. (`src/pages/LoginPage.tsx`)
- `ProtectedRoute`는 `isAuthenticated()` 결과에 따라 미인증 사용자를 `/login`으로 보냅니다. (`src/components/ProtectedRoute.tsx`, `src/utils/auth.ts`)
- axios 요청 인터셉터는 `Authorization: Bearer <token>` 헤더를 자동으로 붙입니다. (`src/api/client.ts`)
- 응답이 401이면 `/login`으로 이동합니다. (`src/api/client.ts`)

## API / WebSocket 엔드포인트 설정

현재 엔드포인트는 **환경변수 없이 코드에 하드코딩**되어 있습니다.

- **REST API Base URL**: `src/api/client.ts`의 `BASE_URL` (기본값 `http://localhost:8080/api`)
- **WebSocket URL**: `src/hooks/useBoardSocket.ts`의 `brokerURL` (기본값 `ws://localhost:8080/ws`)

## 폴더 구조

```
src/
  api/            # axios 클라이언트
  components/     # 다이얼로그/ProtectedRoute 등 공용 컴포넌트
  hooks/          # 보드 데이터 로직, 소켓 구독 훅
  pages/          # 라우팅 단위 페이지(Login/ProjectList/KanbanBoard)
  types/          # 타입 정의
  utils/          # 인증 유틸
```

## 개발 메모

- `vite.config.ts`에서 일부 라이브러리(sokjs 등)가 기대하는 `global`을 `globalThis`로 치환하도록 설정되어 있습니다.
