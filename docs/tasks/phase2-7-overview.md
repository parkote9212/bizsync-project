# Phase 2~7 태스크 체크리스트 (요약)

> Phase 1이 완료되면 각 Phase 시작 시 상세 체크리스트를 작성합니다.
> 현재는 핵심 태스크와 파일 목록만 정리합니다.

---

## Phase 2-1: Kafka 인프라 + 알림 시스템 (3주차)

### 생성할 파일
- [ ] `docker-compose.dev.yml` — Kafka + Zookeeper 추가
- [ ] `backend/build.gradle` — `spring-kafka` 의존성 추가
- [ ] `global/config/KafkaConfig.java` — Producer/Consumer 설정
- [ ] `global/config/KafkaTopicConfig.java` — Topic 자동 생성
- [ ] `notification/event/NotificationEvent.java` — 이벤트 DTO
- [ ] `notification/event/NotificationEventPublisher.java` — Kafka Producer
- [ ] `notification/event/NotificationEventConsumer.java` — Kafka Consumer → WebSocket

### 수정할 파일
- [ ] `notification/service/NotificationService.java` — Kafka Producer 호출 추가
- [ ] `application-dev.yml` — Kafka 설정 추가

---

## Phase 2-2: 결재/활동 이벤트 + DLQ (4주차)

### 생성할 파일
- [ ] `approval/event/ApprovalEvent.java`
- [ ] `approval/event/ApprovalEventPublisher.java`
- [ ] `domain/activity/entity/ActivityLog.java`
- [ ] `domain/activity/repository/ActivityLogRepository.java`
- [ ] `domain/activity/consumer/ActivityLogConsumer.java`
- [ ] `domain/activity/service/ActivityLogService.java`
- [ ] `global/config/KafkaDlqConfig.java` — Dead Letter Queue

### 수정할 파일
- [ ] `approval/service/ApprovalService.java` — 이벤트 발행 추가

---

## Phase 3-1: Next.js 프로젝트 셋업 (5주차)

### 생성할 구조
```bash
npx create-next-app@latest frontend-v2 --typescript --tailwind --app --src-dir
```

### 핵심 파일
- [ ] `frontend-v2/src/app/layout.tsx` — 공통 레이아웃
- [ ] `frontend-v2/src/app/page.tsx` — 랜딩 페이지 (SSR)
- [ ] `frontend-v2/src/app/(auth)/login/page.tsx` — 로그인
- [ ] `frontend-v2/src/app/(auth)/signup/page.tsx` — 회원가입
- [ ] `frontend-v2/src/app/(dashboard)/dashboard/page.tsx` — 대시보드
- [ ] `frontend-v2/src/app/(dashboard)/projects/page.tsx` — 프로젝트 목록
- [ ] `frontend-v2/src/app/api/auth/[...nextauth]/route.ts` — NextAuth
- [ ] `frontend-v2/src/lib/api.ts` — API 클라이언트
- [ ] `frontend-v2/src/middleware.ts` — 인증 미들웨어

---

## Phase 3-2: 칸반/결재/실시간 전환 (6주차)

### 핵심 파일
- [ ] `frontend-v2/src/app/(dashboard)/projects/[id]/page.tsx` — 칸반 보드
- [ ] `frontend-v2/src/app/(dashboard)/approval/page.tsx` — 결재
- [ ] `frontend-v2/src/app/(dashboard)/organization/page.tsx` — 조직도
- [ ] `frontend-v2/src/hooks/useWebSocket.ts` — WebSocket 훅
- [ ] `frontend-v2/src/components/kanban/` — 칸반 컴포넌트

---

## Phase 3.5: OAuth2 실제 계정 연동 + 소셜 로그인 UI (6주차+)

> Phase 1-2에서 코드 구현은 완료. 여기서는 실제 플랫폼 등록 + 프론트엔드 UI를 추가합니다.

### 필수 선행 작업: YAML 인덴테이션 버그 수정
- [ ] `application-dev.yml` — OAuth2 설정이 `logging:` 하위에 잘못 위치 → `spring:` 하위로 이동
- [ ] `application-prod.yml` — 동일하게 확인/수정
- [ ] `application-dev.yml` — mybatis 설정 잔여 블록 제거

### Task 1: 플랫폼별 앱 등록 + 키 발급 (웹 콘솔 작업)

| 플랫폼 | 개발자 콘솔 | 등록할 Redirect URI |
|--------|-----------|--------------------|
| Google | console.cloud.google.com | `http://localhost:8080/login/oauth2/code/google` |
| GitHub | github.com/settings/developers | `http://localhost:8080/login/oauth2/code/github` |
| Kakao | developers.kakao.com | `http://localhost:8080/api/auth/oauth2/callback/kakao` |

발급받은 키를 `.env`에 설정:
```env
GOOGLE_CLIENT_ID=실제값
GOOGLE_CLIENT_SECRET=실제값
GITHUB_CLIENT_ID=실제값
GITHUB_CLIENT_SECRET=실제값
KAKAO_CLIENT_ID=실제값
KAKAO_CLIENT_SECRET=실제값
```

### Task 2: 프론트엔드 소셜 로그인 버튼 추가

- [ ] 로그인 페이지에 "구글로 로그인" / "GitHub로 로그인" / "카카오로 로그인" 버튼 추가
- [ ] 버튼 클릭 시 리다이렉트:
  - Google: `http://localhost:8080/oauth2/authorization/google`
  - GitHub: `http://localhost:8080/oauth2/authorization/github`
  - Kakao: `http://localhost:8080/oauth2/authorization/kakao`
- [ ] OAuth2 콜백 후 JWT 토큰 수신 처리 (redirect 페이지)
- [ ] 프로필 페이지에 연동된 소셜 계정 표시 + 연동 해제 기능

### Task 3: E2E 테스트

- [ ] 소셜 로그인 → JWT 발급 → API 접근 플로우 확인
- [ ] 기존 이메일/비밀번호 로그인 정상 동작 확인
- [ ] 신규 OAuth2 사용자 자동 생성 확인
- [ ] 기존 사용자 이메일 매칭 연동 확인

---

## Phase 4-1: Next.js API Routes BFF 패턴 + 백엔드 연동 (7주차)

> 별도 Node.js BFF 서버 없이 Next.js API Routes로 BFF 패턴 적용.
> Spring Boot에 이미 모든 로직이 있으므로 중계 서버는 불필요.

### Task 1: API 클라이언트 + 인증 연동
- [ ] `frontend-next/src/lib/api.ts` — Axios 인스턴스 (Spring Boot baseURL, JWT 헤더)
- [ ] `frontend-next/src/lib/auth.ts` — 토큰 저장/갱신 유틸
- [ ] `frontend-next/src/middleware.ts` — 인증 미들웨어 (미인증 시 로그인 리다이렉트)

### Task 2: API Routes (BFF 집약 엔드포인트)
- [ ] `frontend-next/src/app/api/dashboard/route.ts` — 대시보드 데이터 집약 (통계 + 최근활동 + 알림)
- [ ] `frontend-next/src/app/api/projects/route.ts` — 프로젝트 CRUD 프록시
- [ ] `frontend-next/src/app/api/projects/[id]/board/route.ts` — 칸반 보드 데이터
- [ ] `frontend-next/src/app/api/approvals/route.ts` — 결재 프록시
- [ ] `frontend-next/src/app/api/auth/[...nextauth]/route.ts` — NextAuth.js (JWT + OAuth2)

### Task 3: 페이지 → 실제 데이터 연동
- [ ] 대시보드 — 목업 데이터 → Spring Boot API 호출
- [ ] 프로젝트 목록 — 목업 데이터 → Spring Boot API 호출
- [ ] 칸반 보드 — WebSocket 직접 연결 (Spring Boot `/ws-kanban`)
- [ ] 결재 — 목업 데이터 → Spring Boot API 호출
- [ ] 알림 — WebSocket 직접 연결 (Spring Boot `/ws`)
- [ ] 채팅 — WebSocket 직접 연결

### Task 4: 환경 설정
- [ ] `frontend-next/.env.local` — `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` 등
- [ ] `frontend-next/next.config.ts` — API 프록시 rewrites 설정 (CORS 회피)

---

## Phase 4-2: 통합 테스트 + 1차 재배포 (8주차)

- [ ] E2E 테스트 작성
- [ ] 성능 측정 (v1 vs v2)
- [ ] `docker-compose.yml` 업데이트 (Kafka, Next.js 포함)
- [ ] CI/CD 파이프라인 업데이트
- [ ] **🚀 1차 재배포**

---

## Phase 5-1: 파일 첨부 (9주차)

### 생성할 파일
- [ ] `domain/file/entity/FileAttachment.java`
- [ ] `domain/file/repository/FileAttachmentRepository.java`
- [ ] `domain/file/service/FileStorageService.java` — S3/MinIO 연동
- [ ] `domain/file/service/FileService.java`
- [ ] `domain/file/controller/FileController.java`
- [ ] `domain/file/dto/FileUploadResponseDTO.java`
- [ ] `global/config/S3Config.java`

### 의존성 추가
```groovy
implementation 'software.amazon.awssdk:s3:2.25.0'
```

---

## Phase 5-2: 댓글 시스템 (10주차)

### 생성할 파일
- [ ] `domain/comment/entity/Comment.java`
- [ ] `domain/comment/repository/CommentRepository.java`
- [ ] `domain/comment/repository/CommentRepositoryCustom.java` — 계층형 조회
- [ ] `domain/comment/repository/CommentRepositoryCustomImpl.java`
- [ ] `domain/comment/service/CommentService.java`
- [ ] `domain/comment/controller/CommentController.java`
- [ ] `domain/comment/dto/CommentRequestDTO.java`
- [ ] `domain/comment/dto/CommentResponseDTO.java`
- [ ] `domain/comment/event/CommentEventPublisher.java` — Kafka

---

## Phase 6-1: 통합 검색 (11주차)

### 생성할 파일
- [ ] `domain/search/controller/SearchController.java`
- [ ] `domain/search/service/SearchService.java`
- [ ] `domain/search/dto/SearchCondition.java` — 검색 조건 DTO
- [ ] `domain/search/dto/SearchResultDTO.java`
- [ ] 각 도메인 Repository에 검색용 Custom 메서드 추가

---

## Phase 6-2: 알림 + 대시보드 통계 (12주차)

### 생성할 파일 (알림)
- [ ] `domain/notification/entity/NotificationEntity.java`
- [ ] `domain/notification/repository/NotificationRepository.java`
- [ ] `domain/notification/controller/NotificationController.java`
- [ ] `domain/notification/dto/NotificationResponseDTO.java`

### 수정할 파일 (대시보드)
- [ ] `domain/dashboard/service/DashboardService.java` — 통계 쿼리 추가
- [ ] `domain/dashboard/controller/DashboardController.java` — API 추가
- [ ] 각 도메인 RepositoryCustom에 집계 쿼리 추가

---

## Phase 7: 최종 통합 + 2차 재배포 (13주차)

- [ ] 전체 E2E 테스트
- [ ] 성능 측정
- [ ] Docker Compose 최종 (S3/MinIO 포함)
- [ ] CI/CD 최종
- [ ] README 최종 정리
- [ ] **🚀 2차 재배포**
