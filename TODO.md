# BizSync 배포 전 TODO 리스트

> 작성일: 2026-01-22
> 최종 수정: 2026-01-22
> 프로젝트: 협업 프로젝트 관리 시스템 (BizSync)

---

## 📋 목차
- [구현 완료 현황](#구현-완료-현황)
- [필수 (CRITICAL)](#필수-critical)
- [권장 (RECOMMENDED)](#권장-recommended)
- [선택 (OPTIONAL)](#선택-optional)

---

## ✅ 구현 완료 현황

### Backend 구현 완료
| 기능 | 파일 | 비고 |
|------|------|------|
| 회원가입 | `AuthController.signup()` | ✅ |
| 로그인/JWT | `AuthService.login()` | Access + Refresh Token |
| 토큰 갱신 | `AuthService.refresh()` | Refresh Token Rotation |
| 비밀번호 변경 | `AuthService.changePassword()` | ✅ |
| 프로젝트 CRUD | `ProjectService` | 생성/수정/삭제 |
| 프로젝트 완료/재진행 | `ProjectService` | ✅ |
| 멤버 초대 | `ProjectService.inviteMember()` | ✅ |
| 멤버 권한 변경 | `ProjectService.updateMemberRole()` | ✅ |
| 멤버 삭제 | `ProjectService.removeMember()` | ✅ |
| 멤버 목록 조회 | `ProjectService.getProjectMembers()` | ✅ |
| 권한 체크 | `@RequireProjectLeader`, `@RequireProjectMember` | AOP 기반 |
| 컬럼 생성/삭제 | `KanbanService` | PL만 삭제 가능 |
| 업무 CRUD | `KanbanService` | 생성/조회/수정/삭제/이동 |
| 전자결재 | `ApprovalService` | 기안/승인/반려, Pessimistic Lock |
| 대시보드 | `DashboardController` | 통계/내 업무 |
| 엑셀 업로드/다운로드 | `ExcelService` | Apache POI |
| 알림 시스템 | `NotificationService` | WebSocket 실시간 |
| 채팅 | `ChatService` | WebSocket |
| **환경변수 분리** | `application-dev.yml`, `.env` | ✅ 완료 |

### Frontend 구현 완료
| 기능 | 파일 | 비고 |
|------|------|------|
| 회원가입 | `LoginPage.tsx` | Dialog 방식 |
| 다크모드 | `themeStore.ts`, `Layout.tsx` | 토글 버튼 |
| 프로젝트 목록 | `ProjectListPage.tsx` | ✅ |
| 프로젝트 생성 | `ProjectCreateDialog.tsx` | ✅ |
| 프로젝트 수정/삭제 | `ProjectSettingsDialog.tsx` | 설정 탭 |
| 멤버 관리 | `ProjectMembersTab.tsx` | 권한변경/삭제 |
| 칸반 보드 | `KanbanBoardPage.tsx` | 드래그앤드롭 |
| 컬럼 생성/삭제 | `KanbanBoardPage.tsx` | ✅ |
| 업무 생성/상세/수정 | `TaskCreateDialog.tsx`, `TaskDetailDialog.tsx` | ✅ |
| 팀원 초대 | `ProjectInviteDialog.tsx` | ✅ |
| 엑셀 업로드/다운로드 | `KanbanBoardPage.tsx` | ✅ |
| 전자결재 | `ApprovalPage.tsx` | 기안함/결재대기함 |
| 대시보드 | `DashboardPage.tsx` | 통계/내 업무 |
| 조직도 | `OrganizationPage.tsx` | 사용자 검색 |
| 인증 보호 | `ProtectedRoute.tsx` | 라우트 가드 |
| 실시간 알림 | `useNotificationSocket.ts` | WebSocket |
| 실시간 보드 동기화 | `useBoardSocket.ts` | WebSocket |

---

## 💡 권장 (RECOMMENDED)

운영 안정성을 위해 구현을 권장하는 항목입니다.

### 5. 관리자 기능 (난이도: ⭐⭐⭐)

> **현재 상태**: `Role.ADMIN`은 정의되어 있으나 실제 사용되지 않음

#### 5.1 관리자 대시보드 🔧 권장
- **목적**: 전체 시스템 모니터링
- **기능**:
  - 전체 사용자 목록 및 관리
  - 전체 프로젝트 현황
  - 시스템 통계

#### 5.2 권한 기반 메뉴 분기 🔧 권장
- **작업 내용**: `Layout.tsx`에서 ADMIN 역할 시 관리자 메뉴 표시
  ```typescript
  {user.role === 'ADMIN' && (
    <ListItemButton onClick={() => navigate('/admin')}>
      <ListItemIcon><AdminPanelSettings /></ListItemIcon>
      <ListItemText primary="관리자" />
    </ListItemButton>
  )}
  ```

---


#### 6.2 초기 데이터 스크립트 🔧 권장
- **파일**: `backend/src/main/resources/data.sql`
  ```sql
  -- 관리자 계정 (비밀번호: admin1234!)
  INSERT INTO users (email, password, name, department, role, position, created_at)
  SELECT 'admin@bizsync.com', 
         '$2a$10$...(bcrypt hash)...',
         '시스템 관리자', 'IT', 'ADMIN', 'MANAGER', NOW()
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@bizsync.com');
  ```

---

### 7. 테스트 (난이도: ⭐⭐⭐)

#### 7.1 단위 테스트 보강 🔧 권장
- **현재 상태**: 일부 Service 테스트 존재
- **추가 필요**:
  - `ProjectServiceTest` - 권한 체크 테스트
  - `AuthServiceTest` - 비밀번호 변경 테스트
  - Controller 통합 테스트

---

### 8. 백엔드 헬스체크 (난이도: ⭐⭐)

#### 8.1 Spring Boot Actuator 헬스체크 엔드포인트 추가 🔧 권장
- **목적**: 컨테이너 및 로드밸런서에서 서버 상태 확인
- **작업 내용**:
  - `build.gradle`에 Actuator 의존성 추가
    ```gradle
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    ```
  - `application-prod.yml`에 헬스체크 엔드포인트 설정
    ```yaml
    management:
      endpoints:
        web:
          exposure:
            include: health,info
      endpoint:
        health:
          show-details: when-authorized
    ```
  - `docker-compose.yml`의 healthcheck 설정 활용
    ```yaml
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    ```
- **파일**: 
  - `backend/build.gradle`
  - `backend/src/main/resources/application-prod.yml`
  - `docker-compose.yml`

#### 8.2 커스텀 헬스체크 (선택) 🔧 권장
- **목적**: 데이터베이스 연결 상태 등 상세 헬스체크
- **작업 내용**:
  - `HealthIndicator` 구현하여 DB 연결 상태 확인
  - WebSocket 연결 상태 확인 (선택)

---

### 9. CI/CD 구축 (난이도: ⭐⭐⭐⭐)

#### 9.1 GitHub Actions 워크플로우 설정 🔧 권장
- **목적**: 자동 빌드, 테스트, 배포 파이프라인 구축
- **작업 내용**:
  - **Backend CI/CD**:
    ```yaml
    # .github/workflows/backend-ci-cd.yml
    - Java 21 환경에서 빌드
    - 단위 테스트 실행
    - Docker 이미지 빌드
    - Docker Hub 또는 ECR에 푸시
    - EC2에 자동 배포 (선택)
    ```
  - **Frontend CI/CD**:
    ```yaml
    # .github/workflows/frontend-ci-cd.yml
    - Node.js 환경에서 빌드
    - 린트 및 타입 체크
    - Docker 이미지 빌드
    - Docker Hub 또는 ECR에 푸시
    - EC2에 자동 배포 (선택)
    ```
- **파일**: `.github/workflows/backend-ci-cd.yml`, `.github/workflows/frontend-ci-cd.yml`

#### 9.2 배포 전략 🔧 권장
- **Blue-Green 배포**: 무중단 배포를 위한 전략
- **롤백 계획**: 배포 실패 시 자동 롤백
- **환경 변수 관리**: GitHub Secrets 활용

#### 9.3 Docker 이미지 태깅 전략 🔧 권장
- **태그 규칙**: `v1.0.0`, `latest`, `main`, `develop`
- **이미지 버전 관리**: Semantic Versioning

---

## 🎨 선택 (OPTIONAL)

시간 여유가 있을 때 구현하면 좋은 항목입니다.

### 10. 추가 기능

#### 10.1 이메일 알림 🎯 선택
- **목적**: 결재 요청/승인/반려 시 이메일 발송
- **도구**: Spring Mail, AWS SES

#### 10.2 PWA 지원 🎯 선택
- **목적**: 모바일 앱처럼 설치 가능
- **작업**: Service Worker, manifest.json

---

## 📊 우선순위 매트릭스

| 항목 | 난이도 | 중요도 | 예상 시간 | 우선순위 |
|-----|--------|--------|-----------|---------|
| 관리자 기능 | ⭐⭐⭐ | 🔥🔥 | 1일 | 4 |
| 테스트 코드 | ⭐⭐⭐ | 🔥🔥 | 2일 | 4 |
| 백엔드 헬스체크 | ⭐⭐ | 🔥🔥 | 1시간 | 3 |
| CI/CD 구축 | ⭐⭐⭐⭐ | 🔥🔥🔥 | 1일 | 3 |

---

## ✅ 배포 전 체크리스트

### 필수 체크 (Frontend)
- [x] API URL 환경 변수화 완료
- [x] WebSocket URL 환경 변수화 완료
- [x] `.env.example` 파일 생성 완료
- [x] `.env.production` 파일 생성 완료

### 필수 체크 (Backend)
- [x] 환경 변수 분리 완료 (`.env` + `application-dev.yml`)
- [x] `application-prod.yml` 생성 완료
- [x] CORS 프로덕션 도메인 설정 완료

### 필수 체크 (Docker)
- [x] Backend Dockerfile 작성 완료
- [x] Frontend Dockerfile 작성 완료
- [x] nginx.conf 작성 완료
- [x] docker-compose.yml 작성 완료 (EC2+RDS 환경)

### 배포 후 확인
- [x] 로그인/회원가입 테스트 ✅
- [x] 프로젝트 생성/수정/삭제 테스트 ✅
- [x] 칸반 보드 드래그앤드롭 테스트 ✅
- [x] WebSocket 실시간 동기화 테스트 ✅
- [x] 결재 프로세스 테스트 ✅
- [x] 에러 로그 모니터링 ✅
- [x] 배포 및 테스트 성공 ✅

---

## 🔄 업데이트 로그

| 날짜 | 작성자 | 변경 내용 |
|-----|--------|----------|
| 2026-01-22 | AI Assistant | 초기 TODO 리스트 작성 |
| 2026-01-22 | AI Assistant | 구현 완료 현황 추가, Backend 환경변수 분리 완료 반영 |
| 2026-01-22 | AI Assistant | 배포 및 테스트 성공 완료 표시, 백엔드 헬스체크 및 CI/CD 구축 항목 추가 |
