# BizSync Frontend

BizSync의 프론트엔드 애플리케이션입니다. React 19 + TypeScript + Vite로 구축되었습니다.

## 🌐 배포 정보

- **배포 URL**: http://54.180.155.0

### 🔐 Demo Account

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@bizsync.com | Admin123!@# |
| 일반 사용자 | test1@test.com | test1234 |
| 일반 사용자 | test2@test.com | test1234 |
| 일반 사용자 | test3@test.com | test1234 |

> ⚠️ 테스트용 계정입니다. 데이터는 주기적으로 초기화됩니다.

---

## 🛠️ 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 19 | UI 라이브러리 |
| **TypeScript** | 5.9 | 타입 안정성 |
| **Vite** | 7.2 | 빌드 도구 (HMR) |
| **Material-UI (MUI)** | 7.3 | UI 컴포넌트 |
| **Zustand** | 5.0 | 전역 상태 관리 |
| **React Router DOM** | 7 | 클라이언트 라우팅 |
| **@hello-pangea/dnd** | 18.0 | Drag & Drop (React 19 호환) |
| **@stomp/stompjs** | 7.2 | WebSocket 실시간 통신 |
| **axios** | - | HTTP 클라이언트 |

---

## 📁 프로젝트 구조

```
src/
├── api/
│   └── client.ts              # axios 인스턴스, 인터셉터
├── components/
│   ├── Layout.tsx             # 메인 레이아웃 (Navbar, Sidebar)
│   ├── ProtectedRoute.tsx     # 인증 보호 라우트
│   ├── ColumnCreateDialog.tsx
│   ├── TaskCreateDialog.tsx
│   ├── TaskDetailDialog.tsx
│   └── ...
├── hooks/
│   ├── useBoardSocket.ts      # 칸반 보드 WebSocket
│   ├── useKanbanBoard.ts      # 칸반 보드 상태 관리
│   └── useNotificationSocket.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectListPage.tsx
│   ├── KanbanBoardPage.tsx
│   ├── ApprovalPage.tsx
│   └── admin/
│       └── AdminUserPage.tsx
├── stores/
│   ├── userStore.ts           # 사용자 상태
│   ├── projectStore.ts        # 프로젝트 상태
│   ├── kanbanStore.ts         # 칸반 보드 상태
│   └── themeStore.ts          # 다크모드
├── types/
│   ├── kanban.ts
│   └── approval.ts
├── utils/
│   └── auth.ts                # 토큰 관리
├── App.tsx                    # 라우팅 설정
└── main.tsx
```

---

## 🚀 빠른 시작

### 요구 사항

- **Node.js 18+**
- **npm** 또는 **yarn**

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버: `http://localhost:5173`

### 환경 변수

`.env` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

---

## 🔑 주요 기능

### 인증

- JWT 토큰 관리 (localStorage)
- 401 응답 시 자동 로그아웃
- 로그인 페이지에서 백엔드 에러 메시지 표시

### 칸반 보드

- **Drag & Drop**: `@hello-pangea/dnd`로 업무 이동
- **낙관적 업데이트**: 드래그 즉시 UI 반영, 실패 시 롤백
- **실시간 동기화**: WebSocket으로 다른 사용자 변경사항 수신
- **권한 기반 UI**: PL만 컬럼 생성/삭제 버튼 표시

### 상태 관리 (Zustand)

```typescript
// stores/userStore.ts
export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### API 클라이언트

```typescript
// api/client.ts - JWT 자동 추가 및 401 처리
client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🛤️ 라우팅

| 경로 | 컴포넌트 | 권한 |
|------|----------|------|
| `/login` | LoginPage | 공개 |
| `/dashboard` | DashboardPage | 인증 필요 |
| `/projects` | ProjectListPage | 인증 필요 |
| `/projects/:id` | KanbanBoardPage | 인증 필요 |
| `/approvals` | ApprovalPage | 인증 필요 |
| `/admin/users` | AdminUserPage | ADMIN 필요 |

---

## 🐳 Docker

### 빌드

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://54.180.155.0/api \
  --build-arg VITE_WS_URL=ws://54.180.155.0/ws \
  -t bizsync-frontend .
```

### Nginx 설정

- 정적 파일 서빙 (`/usr/share/nginx/html`)
- `/api/*` 요청은 백엔드로 프록시
- SPA 라우팅 지원 (`try_files`)

---

## 🚢 CI/CD 배포

GitHub Actions로 `main` 브랜치 푸시 시 자동 배포:

1. `npm run lint` - ESLint 검사
2. `npm run build` - 프로덕션 빌드
3. Docker 이미지 빌드 → ECR 푸시
4. EC2에서 컨테이너 재시작

### 배포 전 체크리스트

```bash
# 린트 검사 (필수!)
npm run lint

# 빌드 확인
npm run build
```

---

## 🧪 개발 도구

```bash
# 린트 검사
npm run lint

# 타입 체크
npx tsc --noEmit

# 빌드
npm run build

# 빌드 프리뷰
npm run preview
```

---

## 📝 주요 설계 결정

### React 19 + @hello-pangea/dnd

- `react-beautiful-dnd`가 React 19 미지원
- `@hello-pangea/dnd`로 마이그레이션 (API 동일)

### Zustand vs Redux

- 보일러플레이트 최소화
- 간단한 상태 관리에 적합
- 서버 상태는 컴포넌트 로컬에서 관리

### 낙관적 업데이트

```typescript
// 드래그 완료 시
const handleDragEnd = async (result) => {
  // 1. 즉시 UI 업데이트
  setBoardData(optimisticUpdate(result));
  
  // 2. API 호출
  try {
    await moveTask(taskId, columnId, sequence);
  } catch {
    // 3. 실패 시 롤백
    fetchBoard();
  }
};
```

---

## 📄 라이선스

포트폴리오 목적으로 제작되었습니다.
