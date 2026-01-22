# BizSync Frontend

BizSync의 프론트엔드 애플리케이션입니다. React + TypeScript + Vite로 구축되었으며, 프로젝트 관리, 칸반 보드, 결재 시스템 등의 기능을 제공합니다.

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite 7** - 빌드 도구 및 개발 서버
- **React Router DOM 7** - 클라이언트 사이드 라우팅
- **Material-UI (MUI) 7** - UI 컴포넌트 라이브러리
- **@emotion/react**, **@emotion/styled** - CSS-in-JS 스타일링
- **Zustand 5** - 상태 관리
- **axios** - HTTP 클라이언트
- **@stomp/stompjs** - WebSocket (STOMP) 클라이언트
- **@hello-pangea/dnd** - Drag & Drop 기능

## 주요 기능

### 인증 및 권한

- **로그인**: 이메일/비밀번호 기반 인증
- **JWT 토큰 관리**: Access Token 및 Refresh Token을 localStorage에 저장
- **인증 보호 라우팅**: `ProtectedRoute` 컴포넌트로 인증이 필요한 페이지 보호
- **자동 토큰 갱신**: Access Token 만료 시 자동 갱신

### 프로젝트 관리

- **프로젝트 목록**: 사용자가 참여한 프로젝트 목록 조회
- **프로젝트 생성**: 새 프로젝트 생성 다이얼로그
- **프로젝트 설정**: 프로젝트 정보 수정 및 멤버 관리
- **프로젝트 멤버 초대**: 이메일로 팀원 초대

### 칸반 보드

- **실시간 보드 동기화**: WebSocket을 통한 실시간 업데이트
- **Drag & Drop**: 업무를 컬럼 간 이동
- **낙관적 업데이트**: 즉각적인 UI 반영 후 서버 동기화
- **컬럼 관리**: 컬럼 생성, 수정, 삭제
- **업무 관리**: 업무 생성, 수정, 삭제, 담당자 지정, 마감일 설정

### 결재 시스템

- **결재 문서 목록**: 결재 대기/진행/완료 문서 조회
- **결재 문서 생성**: 새 결재 문서 작성
- **결재 처리**: 승인/반려 처리
- **결재 상태 추적**: 결재 라인별 상태 확인

### 대시보드

- **프로젝트 현황**: 전체 프로젝트 통계 및 현황
- **업무 현황**: 담당 업무 및 마감일 관리

### 조직도

- **조직 구조 조회**: 회사 조직도 및 부서 정보

## 프로젝트 구조

```
src/
├── api/                    # API 클라이언트
│   └── client.ts          # axios 인스턴스 및 인터셉터
├── components/             # 재사용 가능한 컴포넌트
│   ├── Layout.tsx         # 메인 레이아웃 (네비게이션 바, 사이드바)
│   ├── ProtectedRoute.tsx # 인증 보호 라우트 컴포넌트
│   ├── ColumnCreateDialog.tsx
│   ├── PasswordChangeDialog.tsx
│   ├── ProjectCreateDialog.tsx
│   ├── ProjectInviteDialog.tsx
│   ├── ProjectMembersTab.tsx
│   ├── ProjectSettingsDialog.tsx
│   ├── TaskCreateDialog.tsx
│   └── TaskDetailDialog.tsx
├── hooks/                  # 커스텀 훅
│   ├── useBoardSocket.ts  # 칸반 보드 WebSocket 구독
│   ├── useKanbanBoard.ts  # 칸반 보드 데이터 관리
│   └── useNotificationSocket.ts # 알림 WebSocket 구독
├── pages/                  # 페이지 컴포넌트
│   ├── ApprovalPage.tsx   # 결재 페이지
│   ├── DashboardPage.tsx  # 대시보드 페이지
│   ├── KanbanBoardPage.tsx # 칸반 보드 페이지
│   ├── LoginPage.tsx      # 로그인 페이지
│   ├── OrganizationPage.tsx # 조직도 페이지
│   └── ProjectListPage.tsx # 프로젝트 목록 페이지
├── stores/                 # Zustand 상태 관리
│   ├── approvalStore.ts   # 결재 상태
│   ├── kanbanStore.ts     # 칸반 보드 상태
│   ├── notificationStore.ts # 알림 상태
│   ├── projectStore.ts    # 프로젝트 상태
│   ├── themeStore.ts      # 테마 상태
│   ├── uiStore.ts         # UI 상태
│   └── userStore.ts       # 사용자 상태
├── types/                  # TypeScript 타입 정의
│   ├── approval.ts        # 결재 관련 타입
│   ├── common.ts          # 공통 타입
│   └── kanban.ts          # 칸반 보드 관련 타입
├── utils/                  # 유틸리티 함수
│   └── auth.ts            # 인증 관련 유틸리티
├── App.tsx                 # 메인 앱 컴포넌트 (라우팅)
└── main.tsx                # 앱 진입점
```

## 빠른 시작

### 요구 사항

- **Node.js 18+** 및 **npm**
- 백엔드 서버 실행 중 (기본: `http://localhost:8080`)

### 설치 및 실행

#### 1. 의존성 설치

```bash
npm install
```

#### 2. 환경 변수 설정 (선택사항)

프로젝트 루트에 `.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

**참고**: 현재는 환경 변수 없이 코드에 하드코딩되어 있습니다. 환경 변수를 사용하려면 `src/api/client.ts`와 `src/hooks/useBoardSocket.ts`를 수정해야 합니다.

#### 3. 개발 서버 실행

```bash
npm run dev
```

기본적으로 `http://localhost:5173`에서 실행됩니다.

#### 4. 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 프리뷰
npm run preview
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### Docker로 실행

```bash
# Docker 이미지 빌드
docker build -t bizsync-frontend .

# 컨테이너 실행
docker run -p 80:80 \
  --build-arg VITE_API_BASE_URL=http://localhost:8080/api \
  --build-arg VITE_WS_URL=ws://localhost:8080/ws \
  bizsync-frontend
```

## 라우팅

애플리케이션의 라우팅 구조는 다음과 같습니다:

- `/` → `/dashboard`로 리다이렉트
- `/login` - 로그인 페이지 (인증 불필요)
- `/dashboard` - 대시보드 페이지 (인증 필요)
- `/projects` - 프로젝트 목록 페이지 (인증 필요)
- `/projects/:projectId` - 칸반 보드 페이지 (인증 필요)
- `/approvals` - 결재 페이지 (인증 필요)
- `/organization` - 조직도 페이지 (인증 필요)

라우팅 정의는 `src/App.tsx`에 있습니다.

## 인증 및 토큰 관리

### 로그인 프로세스

1. 사용자가 `/login`에서 이메일/비밀번호로 로그인
2. 로그인 성공 시 `accessToken`과 `refreshToken`을 `localStorage`에 저장
3. 이후 API 요청 시 `Authorization: Bearer <accessToken>` 헤더 자동 추가

### 토큰 저장 위치

- `localStorage`에 `accessToken`과 `refreshToken` 저장
- `src/utils/auth.ts`의 `saveTokens()`, `getTokens()`, `clearTokens()` 함수 사용

### 인증 보호

- `ProtectedRoute` 컴포넌트가 인증이 필요한 라우트를 보호
- 미인증 사용자는 자동으로 `/login`으로 리다이렉트
- `src/utils/auth.ts`의 `isAuthenticated()` 함수로 인증 상태 확인

### 자동 토큰 갱신

- `src/api/client.ts`의 응답 인터셉터에서 401 에러 발생 시 자동으로 `/login`으로 리다이렉트
- 향후 Refresh Token을 사용한 자동 갱신 기능 추가 가능

## API 통신

### REST API

- **Base URL**: `src/api/client.ts`의 `BASE_URL` (기본값: `http://localhost:8080/api`)
- **클라이언트**: axios 인스턴스 사용
- **인터셉터**:
  - 요청 인터셉터: JWT 토큰 자동 추가
  - 응답 인터셉터: 401 에러 시 로그인 페이지로 리다이렉트

### WebSocket (STOMP)

- **연결 URL**: `src/hooks/useBoardSocket.ts`의 `brokerURL` (기본값: `ws://localhost:8080/ws`)
- **구독 경로**:
  - `/topic/projects/{projectId}/board` - 칸반 보드 변경사항
  - `/user/{userId}/notifications` - 사용자 알림
- **사용 훅**:
  - `useBoardSocket`: 칸반 보드 실시간 동기화
  - `useNotificationSocket`: 알림 실시간 수신

## 상태 관리

Zustand를 사용하여 전역 상태를 관리합니다:

- **userStore**: 현재 로그인한 사용자 정보
- **projectStore**: 프로젝트 목록 및 선택된 프로젝트
- **kanbanStore**: 칸반 보드 데이터 (컬럼, 업무)
- **approvalStore**: 결재 문서 목록 및 상세 정보
- **notificationStore**: 알림 목록
- **uiStore**: UI 상태 (다이얼로그 열림/닫힘 등)
- **themeStore**: 테마 설정 (다크 모드 등)

## 스타일링

- **Material-UI (MUI)**: 주요 UI 컴포넌트
- **Emotion**: CSS-in-JS 스타일링
- **반응형 디자인**: 모바일 및 데스크톱 지원

## 개발 가이드

### 새로운 페이지 추가

1. `src/pages/` 디렉토리에 새 페이지 컴포넌트 생성
2. `src/App.tsx`에 라우트 추가
3. 필요시 `ProtectedRoute`로 감싸기

### 새로운 API 호출 추가

1. `src/api/client.ts`의 axios 인스턴스 사용
2. 필요시 새로운 API 함수를 별도 파일로 분리
3. 타입 정의는 `src/types/`에 추가

### 새로운 상태 추가

1. `src/stores/` 디렉토리에 새 스토어 파일 생성
2. Zustand의 `create` 함수 사용
3. 컴포넌트에서 `useStore` 훅으로 사용

### WebSocket 구독 추가

1. `src/hooks/` 디렉토리에 새 커스텀 훅 생성
2. `@stomp/stompjs`를 사용하여 STOMP 클라이언트 설정
3. 구독 및 메시지 처리 로직 구현

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 디렉토리에 생성되며, 정적 파일로 Nginx 등의 웹 서버에서 서비스할 수 있습니다.

### 환경 변수 설정

빌드 시 환경 변수를 설정하려면:

```bash
VITE_API_BASE_URL=https://api.example.com/api \
VITE_WS_URL=wss://api.example.com/ws \
npm run build
```

### Docker 빌드

```bash
# Dockerfile을 사용하여 이미지 빌드
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com/api \
  --build-arg VITE_WS_URL=wss://api.example.com/ws \
  -t bizsync-frontend .
```

## 문제 해결

### 포트 충돌

기본 포트 5173이 사용 중인 경우:

```bash
# 다른 포트로 실행
npm run dev -- --port 3000
```

또는 `vite.config.ts`에서 포트 설정 변경

### API 연결 실패

- 백엔드 서버가 실행 중인지 확인
- `src/api/client.ts`의 `BASE_URL` 확인
- CORS 설정 확인 (백엔드에서 프론트엔드 도메인 허용)

### WebSocket 연결 실패

- 백엔드 WebSocket 서버가 실행 중인지 확인
- `src/hooks/useBoardSocket.ts`의 `brokerURL` 확인
- 방화벽 설정 확인

### 빌드 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 타입 오류

TypeScript 타입 오류가 발생하는 경우:

```bash
# 타입 체크
npm run build
```

## 개발 메모

- `vite.config.ts`에서 일부 라이브러리(sockjs 등)가 기대하는 `global`을 `globalThis`로 치환하도록 설정되어 있습니다.
- 환경 변수는 `VITE_` 접두사로 시작해야 Vite에서 인식됩니다.
- 프로덕션 빌드 시 환경 변수는 빌드 타임에 주입되므로, 런타임에 변경할 수 없습니다.

## 테스트

```bash
# 테스트 실행 (테스트 설정이 있는 경우)
npm run test

# 린트 검사
npm run lint
```

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
