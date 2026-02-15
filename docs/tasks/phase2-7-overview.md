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

## Phase 4-1: Node.js BFF (7주차)

### 생성할 구조
```bash
mkdir bff && cd bff
npm init -y
npm install express cors helmet redis ws axios
npm install -D typescript @types/express @types/node ts-node nodemon
```

### 핵심 파일
- [ ] `bff/src/index.ts` — Express 서버
- [ ] `bff/src/routes/dashboard.ts` — Dashboard 집약 API
- [ ] `bff/src/routes/project.ts` — Project Board 집약 API
- [ ] `bff/src/middleware/auth.ts` — JWT 검증 미들웨어
- [ ] `bff/src/websocket/gateway.ts` — WebSocket Gateway
- [ ] `bff/Dockerfile`

---

## Phase 4-2: 통합 테스트 + 1차 재배포 (8주차)

- [ ] E2E 테스트 작성
- [ ] 성능 측정 (v1 vs v2)
- [ ] `docker-compose.yml` 업데이트 (Kafka, BFF 포함)
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
