# CLAUDE.md - BizSync v2 프로젝트 가이드

## 프로젝트 개요

BizSync는 프로젝트 관리, 칸반 보드, 전자결재, 실시간 채팅을 통합한 기업형 협업 플랫폼입니다.
현재 v1에서 v2로 대규모 업그레이드를 진행 중입니다.

## 프로젝트 경로

```
~/code/bizsync-project/
├── backend/          # Spring Boot 3.5.9 + Java 21
├── frontend/         # React 19.2 + Vite + TypeScript (v1, Next.js로 전환 예정)
├── frontend-next/    # Next.js 15 (SSR + API Routes BFF)
├── docs/tasks/       # Phase별 태스크 체크리스트
└── docker-compose.yml
```

## 현재 기술 스택

### Backend
- Java 21 LTS, Spring Boot 3.5.9
- Spring Security + JWT (JJWT 0.12.3)
- Spring Data JPA + **QueryDSL 5.1.0** (Phase 1-1에서 전환 완료)
- Spring WebSocket (STOMP)
- Spring Batch, Spring AOP
- **Spring Kafka** (이벤트 스트리밍 — Phase 2-1에서 도입)
- Redis + Redisson (캐싱, 분산 락)
- MariaDB, Lombok, SpringDoc OpenAPI 2.8.3

### Frontend (v1 — Next.js로 전환 예정)
- React 19.2, TypeScript, Vite
- MUI 7, Zustand, React Router 7, Recharts
- @stomp/stompjs, @hello-pangea/dnd, Axios

## v2 업그레이드 진행 상황

| Phase | 기간 | 핵심 작업 | 상태 |
|-------|------|----------|------|
| **1-1** | 1주 | MyBatis → QueryDSL 전환, 회원가입 변경 | ✅ 완료 |
| **1-2** | 2주 | OAuth2 인증 도입 (Google/GitHub/Kakao) | ✅ 완료 |
| **2-1** | 3주 | Kafka 인프라 + 알림/활동 로그 이벤트 통합 | ✅ 완료 |
| **2-2** | 4주 | 결재 이벤트 + DLQ | ✅ 완료 |
| **3-1** | 5주 | Next.js 프로젝트 셈업 + 핵심 페이지 | ✅ 완료 |
| **3-2** | 6주 | 칸반/결재/알림/채팅 페이지 | ✅ 완료 |
| **3.5** | 6주+ | **OAuth2 실제 계정 연동 + 소셜 로그인 UI** | |
| **4-1** | 7주 | Next.js API Routes BFF 패턴 + 백엔드 연동 | ✅ 완료 |
| **4-2** | 8주 | 통합 테스트 + 1차 재배포 | ✅ 완료 (70%) |
| 5 | 9~10주 | 파일 첨부 (S3), 댓글/코멘트 시스템 | |
| 6 | 11~12주 | 통합 검색 API, 알림 읽음/목록, 대시보드 통계 | |
| 7 | 13주 | 통합 테스트 + 2차 재배포 | |

## 현재 진행 Phase

> **Phase 4-2: 통합 테스트 (약 70% 완료)**
> - ✅ 로그인 API 통합 테스트 완료
> - ✅ JWT 토큰 갱신 로직 검증 완료
> - ✅ 알림 API 통합 테스트 완료
> - ✅ BFF 레이어 정상 작동 확인
> - ⏸️ WebSocket/STOMP 실시간 통신 테스트 (다음)
> - ⏸️ 프로젝트/칸반/결재 API 테스트 (백엔드 오류로 보류)
>
> **상세 보고서**: `docs/phase4-2-integration-test.md`
> **브라우저 테스트 가이드**: `docs/browser-ui-test-guide.md`

---

## Phase 1-1 완료 내역 (참고)

- QueryDSL 의존성 추가 완료 (build.gradle)
- `ProjectRepositoryCustom` + `ProjectRepositoryCustomImpl` — 프로젝트 보드, 내 프로젝트 조회
- `TaskRepositoryCustom` + `TaskRepositoryCustomImpl` — 프로젝트별 업무 정렬 조회
- MyBatis 의존성 제거 완료 (build.gradle)
- MyBatis mapper 파일 제거 완료 (ProjectMapper, TaskMapper)
- 회원가입 기본 상태 PENDING → ACTIVE 변경 완료

## Phase 1-2 완료 내역 (참고)

- OAuth2 Client/Resource Server 의존성 추가 완료
- `OAuthProvider.java` enum, `UserOAuth.java` 엔티티 생성
- `UserOAuthRepository.java` 리포지토리 생성
- `CustomOAuth2UserService.java`, `CustomOAuth2User.java` 구현
- `OAuth2Controller.java` API 엔드포인트 구현
- `SecurityConfig.java` OAuth2 설정 추가 (기존 JWT 병행)

## Phase 2-1 완료 내역 (참고)

- `docker-compose.dev.yml` 생성 (MariaDB + Redis + Kafka + Zookeeper + Kafka UI)
- Spring Kafka 의존성 추가, `KafkaConfig.java` + `KafkaTopicConfig.java` 설정
- `notification/entity/Notification.java` 엔티티 + Repository + Controller
- `notification/consumer/NotificationEventConsumer.java` — Kafka Consumer → DB 저장 + WebSocket
- `notification/service/NotificationQueryService.java` — 알림 조회 서비스
- `activitylog/` 도메인 신규 생성 (entity, repository, consumer, service, controller, dto)
- 비즈니스 서비스에서 Kafka 이벤트 발행 → 알림/활동 로그 자동 생성 통합

## Phase 4-1 완료 내역 (참고)

- Next.js API Routes BFF (Backend for Frontend) 패턴 구현
- 서버사이드 API 클라이언트 (`lib/server/api.ts`) 생성
- 클라이언트 API 클라이언트 (`lib/api.ts`) 수정 - BFF 호출
- 14개 API Routes 생성:
  - `/api/auth/{login,register,refresh}`
  - `/api/projects` (GET, POST)
  - `/api/kanban/[projectId]`, `/api/kanban/tasks`
  - `/api/approvals`, `/api/approvals/[id]/{approve,reject}`
  - `/api/notifications`, `/api/notifications/[id]/read`
- Next.js 16 호환성 수정 (동적 라우트 params를 Promise 타입으로)

## Phase 4-2 완료 내역 (진행 중, 약 70%)

### ✅ 완료된 작업
- **로그인 API 통합 테스트**: JWT 토큰 발급 정상 작동
- **JWT 토큰 갱신 로직 검증**: 리프레시 토큰으로 재발급 성공
- **알림 API 통합 테스트**: 페이징 응답 정상
- **BFF 레이어 검증**: 14개 API Routes 정상 작동
- **버그 수정**: `/api/auth/register` → `/auth/signup` 엔드포인트 불일치 해결
- **문서 작성**:
  - `docs/phase4-2-integration-test.md` - 통합 테스트 종합 보고서
  - `docs/browser-ui-test-guide.md` - 브라우저 UI 테스트 가이드

### ⚠️ 알려진 이슈
- 백엔드 회원가입 API (`POST /api/auth/signup`) 500 에러 - 디버깅 필요
- 백엔드 프로젝트 API (`GET /api/projects`) 500 에러 - 디버깅 필요

### 🔜 남은 작업
- WebSocket/STOMP 실시간 통신 테스트
- 프로젝트/칸반/결재 API 통합 테스트 (백엔드 오류 수정 후)
- 브라우저 E2E 테스트 시나리오 실행
- 성능 테스트 (API 응답 시간 < 500ms)

---

## 코딩 컨벤션

### Java (Backend)

```
패키지 구조: domain/{도메인}/controller|dto|entity|repository|service
네이밍: 클래스 PascalCase, 메서드/변수 camelCase
DTO: {동작}{도메인}RequestDTO / {도메인}{용도}ResponseDTO
엔티티: @Builder + @NoArgsConstructor(access = PROTECTED)
```

- **컨트롤러**: `@RestController`, `@RequestMapping("/api/{도메인}")`, 반환은 `ResponseEntity<>`
- **서비스**: `@Service`, `@Transactional(readOnly = true)` 기본, 변경 메서드만 `@Transactional`
- **리포지토리**: Spring Data JPA 기반, 복잡한 쿼리는 QueryDSL Custom Repository 패턴
- **예외**: `@RestControllerAdvice` 글로벌 핸들러, 커스텀 예외 클래스 사용
- **AOP**: `@RequireProjectLeader`, `@RequireProjectMember` 등 커스텀 어노테이션

### QueryDSL Custom Repository 패턴

```java
// 인터페이스
public interface ProjectRepositoryCustom {
    Optional<ProjectBoardDTO> findProjectBoard(Long projectId);
    List<ProjectListResponseDTO> findMyProjects(Long userId);
}

// 구현체 — JPAQueryFactory는 생성자 주입
@RequiredArgsConstructor
public class ProjectRepositoryCustomImpl implements ProjectRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    // ...
}

// JPA Repository에서 extends
public interface ProjectRepository extends JpaRepository<Project, Long>, ProjectRepositoryCustom {}
```

### TypeScript (Frontend)

```
폴더 구조: api/ | components/ | hooks/ | pages/ | stores/ | types/ | utils/
컴포넌트: 함수형 컴포넌트 + React Hooks
상태관리: Zustand
HTTP: Axios instance (api/axios.ts)
```

## Git 규칙

### 브랜치 전략

```
main ← dev ← feature/{작업명}
                fix/{버그명}
                refactor/{대상}
```

### 커밋 메시지

```
feat(scope): 새 기능 추가
fix(scope): 버그 수정
refactor(scope): 리팩토링
chore(scope): 설정, 의존성
docs(scope): 문서
test(scope): 테스트
```

### 작업 흐름

```bash
git checkout dev && git pull origin dev
git checkout -b feature/{작업명}
# 작업...
git add {파일}
git commit -m "feat(scope): 설명"
git checkout dev && git merge feature/{작업명} --no-ff
git branch -d feature/{작업명}
git push origin dev
```

## 주요 파일 위치

### Backend

| 파일 | 경로 | 설명 |
|------|------|------|
| build.gradle | `backend/build.gradle` | 의존성 (QueryDSL, JPA, Security 등) |
| SecurityConfig | `global/config/SecurityConfig.java` | 보안 설정 (JWT 필터) |
| RedisConfig | `global/config/RedisConfig.java` | Redis 캐싱/세션 |
| User 엔티티 | `domain/user/entity/User.java` | 사용자 (status 기본 ACTIVE) |
| AuthService | `domain/user/service/AuthService.java` | 인증 (JWT 발급/검증) |
| ProjectRepositoryCustomImpl | `domain/project/repository/ProjectRepositoryCustomImpl.java` | QueryDSL 프로젝트 쿼리 |
| TaskRepositoryCustomImpl | `domain/project/repository/TaskRepositoryCustomImpl.java` | QueryDSL 업무 쿼리 |
| application-dev.yml | `src/main/resources/application-dev.yml` | 개발 설정 |

### Frontend

| 파일 | 경로 | 설명 |
|------|------|------|
| package.json | `frontend/package.json` | 의존성 |
| App.tsx | `frontend/src/App.tsx` | 라우팅 |

## 빌드 & 실행

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm run dev

# Docker (로컬 개발)
docker compose -f docker-compose.dev.yml up -d

# 테스트
cd backend && ./gradlew test
```

## 환경 변수

```env
SPRING_DATASOURCE_URL=jdbc:mariadb://localhost:3306/bizsync
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=1234
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-must-be-at-least-256-bits-long
JWT_EXPIRATION_MS=3600000
JWT_REFRESH_EXPIRATION_MS=604800000
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 작업 시 주의사항

1. **엔티티 수정 시**: `@Builder.Default` 값 확인, BaseTimeEntity 상속 유지
2. **Security 수정 시**: 기존 JWT 인증 깨지지 않게 OAuth2 추가
3. **Kafka 도입 시**: 기존 동기 로직 유지하면서 이벤트 발행 추가, 점진적 전환
4. **프론트엔드**: v1 React 코드는 참조용으로 유지, Next.js로 새로 작성
5. **커밋**: 파일 단위 작은 커밋 (Atomic Commit), Conventional Commits 준수
6. **테스트**: 커밋 전 `./gradlew test` 통과 확인

## 프론트엔드 UI/UX 디자인 가이드

### 디자인 컨셈
- **스타일**: 업무용 ERP/SaaS (Notion, Linear, Jira 참고)
- **톤**: 미니멀하고 전문적, 정보 밀도 높지만 정돈된 느낌
- **원칙**: 깨끗한 여백, 명확한 계층 구조, 일관된 간격

### 색상 시스템
```
Primary: #2563EB (blue-600) — 주요 액션, 활성 상태
Secondary: #6B7280 (gray-500) — 보조 텍스트
Success: #059669 (emerald-600) — 완료/승인
Warning: #D97706 (amber-600) — 대기/주의
Danger: #DC2626 (red-600) — 반려/삭제/오류

Background: #F9FAFB (gray-50) — 페이지 배경
Surface: #FFFFFF — 카드/패널 배경
Border: #E5E7EB (gray-200) — 구분선
Text Primary: #111827 (gray-900)
Text Secondary: #6B7280 (gray-500)
```

### 타이포그래피
```
본문: Inter 또는 Pretendard (14px, leading-relaxed)
소제목: 13px semibold, text-gray-500, uppercase tracking-wider
제목: 18~20px semibold
숫자/통계: tabular-nums (고정폭 숫자)
```

### 레이아웃 규칙
```
사이드바: 고정 240px, 배경 흰색, 오른쪽 border
헤더: 고정 56px, 흰색, 하단 border, shadow-sm
콘텐츠 영역: 최대 1280px, mx-auto, px-6, py-6
카드: bg-white, rounded-lg, border border-gray-200, p-5 (shadow 없음 또는 shadow-sm)
간격: 4px 단위 일관 (gap-1=4px, gap-2=8px, gap-4=16px, gap-6=24px)
```

### 컴포넌트 패턴
```
버튼 (Primary): bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700
버튼 (Secondary): bg-white text-gray-700 px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50
입력 필드: border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
상태 배지: inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
테이블: text-sm, 헤더 bg-gray-50 text-gray-500 font-medium, 행 border-b hover:bg-gray-50
탭: border-b-2 활성 색상 표시, 비활성은 text-gray-500
```

### 금지 사항
- ❌ shadow-lg, shadow-xl 남용 (최대 shadow-sm)
- ❌ 과도한 그라데이션, 그라디언트 배경
- ❌ 둥근 모서리 rounded-2xl 이상 (최대 rounded-lg)
- ❌ 네온 색상, 과도한 색상 대비
- ❌ 애니메이션 남용 (transition 최소한)
- ❌ 아이콘 남용 (필수 기능성 아이콘만 사용)

## Phase별 상세 태스크

`docs/tasks/` 디렉토리 참조:
- `docs/tasks/phase1-1-querydsl.md` ✅ 완료
- `docs/tasks/phase1-2-oauth2.md` ✅ 완료
- `docs/tasks/phase2-7-overview.md` (Phase 2~7 요약)
