# BizSync Backend

BizSync의 백엔드 서버입니다. Spring Boot 기반의 RESTful API와 WebSocket을 제공합니다.

## 🌐 배포 정보

- **API URL**: http://54.180.155.0/api

### 🔐 Demo Account

| 역할     | 이메일               | 비밀번호        |
|--------|-------------------|-------------|
| 관리자    | admin@bizsync.com | Admin123!@# |
| 일반 사용자 | test1@test.com    | test1234    |
| 일반 사용자 | test2@test.com    | test1234    |
| 일반 사용자 | test3@test.com    | test1234    |

> ⚠️ 테스트용 계정입니다. 데이터는 주기적으로 초기화됩니다.

---

## 🛠️ 기술 스택

| 기술                           | 버전     | 용도                             |
|------------------------------|--------|--------------------------------|
| **Java**                     | 21     | LTS 버전, Virtual Threads 지원     |
| **Spring Boot**              | 3.5.9  | 프레임워크                          |
| **Spring Security + JWT**    | -      | 인증/인가 (Access + Refresh Token) |
| **Spring WebSocket (STOMP)** | -      | 실시간 보드 동기화, 채팅, 알림             |
| **Spring Data JPA**          | -      | ORM (단순 CRUD)                  |
| **MyBatis**                  | 3.0.5  | 복잡한 조인 쿼리 최적화                  |
| **Spring AOP**               | -      | 프로젝트 권한 체크 분리                  |
| **Spring Batch**             | -      | 배치 작업 (프로젝트 아카이빙 등)             |
| **Redis + Redisson**         | 4.1.0  | 캐시/분산 락                         |
| **Spring Actuator**          | -      | 헬스체크/메트릭                        |
| **SpringDoc OpenAPI**        | 2.8.3  | Swagger UI / API 문서             |
| **JJWT**                     | 0.12.3 | JWT 생성/검증                       |
| **Apache POI**               | 5.4.0  | Excel 업로드/다운로드                 |
| **MariaDB**                  | 10.11+ | 관계형 데이터베이스                     |

---

## 📁 프로젝트 구조

```
src/main/java/com/bizsync/backend/
├── BackendApplication.java
├── domain/
│   ├── approval/             # 결재 도메인 (controller/service/entity/repository/dto)
│   ├── project/              # 프로젝트 도메인 (controller/service/entity/repository/dto/mapper)
│   ├── user/                 # 사용자 도메인 (controller/service/entity/repository/dto)
│   ├── notification/         # 알림 도메인 (model/service/dto)
│   └── dashboard/            # 대시보드 도메인 (controller/service/dto)
├── global/
│   ├── config/               # Security/Redis/Swagger/WebSocket/JPA Auditing 등
│   ├── common/               # aop/exception/util/annotation/entity/dto
│   └── security/             # jwt/filter
└── batch/
    ├── job/                  # 배치 Job 설정
    └── scheduler/            # 스케줄러
```

---

## 🚀 빠른 시작

### 요구 사항

- **Java 21** 이상
- **Gradle 8.0+** (Wrapper 포함)
- **MariaDB 10.11+** 또는 **MySQL 8.0+**

### 로컬 실행

#### 1. 데이터베이스 설정

```bash
mysql -u root -p < ../backend/src/main/resources/db/create.sql
```

#### 2. 환경 변수 설정

`application-dev.yml` 또는 환경 변수:

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/bizsync_db
    username: root
    password: your_password

app:
  jwt:
    secret: your-256-bit-secret-key-here
    expiration-ms: 3600000       # 1시간
    refresh-expiration-ms: 604800000  # 7일

  cors:
    allowed-origins: http://localhost:5173

admin:
  email: admin@bizsync.com
  password: Admin123!@#
```

#### 3. 실행

```bash
./gradlew bootRun
```

서버: `http://localhost:8080`

---

## 🔑 주요 기능

### 인증 (JWT)

```
POST /api/auth/login     → Access Token + Refresh Token 발급
POST /api/auth/refresh   → Access Token 갱신
POST /api/auth/signup    → 회원가입 (PENDING 상태로 생성)
```

### 캐시/분산 락 (Redis + Redisson)

- **캐시**: 프로젝트 목록/권한/대시보드 통계 등 응답 캐싱
- **분산 락**: 결재 처리 시 동시 승인/반려 경쟁 상태 방지 (`RedissonClient` 기반)

### 프로젝트 권한 AOP

```java
// 프로젝트 리더만 실행 가능
@RequireProjectLeader
public void deleteColumn(Long projectId, Long columnId) {
    // 권한 체크는 AOP가 자동 처리
    kanbanColumnRepository.deleteById(columnId);
}
```

### WebSocket (STOMP)

```
/ws                              → STOMP 연결 엔드포인트
/topic/board/{projectId}         → 칸반 보드 실시간 동기화
/topic/notifications/{userId}    → 개인 알림
```

### 배치 (Spring Batch)

- **프로젝트 아카이빙 배치**: 완료 후 일정 기간 경과한 프로젝트를 ARCHIVED로 전환
- **스케줄러**: 매일 새벽 실행 (`@Scheduled`)

### 동시성 제어 (DB 락)

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Project p WHERE p.projectId = :projectId")
Optional<Project> findByIdForUpdate(@Param("projectId") Long projectId);
```

---

## 📚 API 엔드포인트

### 인증

| Method | URL                 | 설명    |
|--------|---------------------|-------|
| POST   | `/api/auth/login`   | 로그인   |
| POST   | `/api/auth/signup`  | 회원가입  |
| POST   | `/api/auth/refresh` | 토큰 갱신 |

### 프로젝트

| Method | URL                                   | 설명         |
|--------|---------------------------------------|------------|
| GET    | `/api/projects`                       | 목록 조회      |
| POST   | `/api/projects`                       | 생성         |
| POST   | `/api/projects/{id}/invite`           | 멤버 초대 (PL) |
| DELETE | `/api/projects/{id}/members/{userId}` | 멤버 삭제 (PL) |

### 칸반

| Method | URL                          | 설명         |
|--------|------------------------------|------------|
| GET    | `/api/projects/{id}/board`   | 보드 조회      |
| POST   | `/api/projects/{id}/columns` | 컬럼 생성 (PL) |
| DELETE | `/api/columns/{id}`          | 컬럼 삭제 (PL) |
| POST   | `/api/columns/{id}/tasks`    | 업무 생성      |
| PUT    | `/api/tasks/{id}/move`       | 업무 이동      |

### 결재

| Method | URL                           | 설명     |
|--------|-------------------------------|--------|
| POST   | `/api/approvals`              | 결재 기안  |
| GET    | `/api/approvals/pending`      | 결재 대기함 |
| POST   | `/api/approvals/{id}/process` | 승인/반려  |

### 관리자

| Method | URL                             | 설명     |
|--------|---------------------------------|--------|
| GET    | `/api/admin/users`              | 사용자 목록 |
| PUT    | `/api/admin/users/{id}/approve` | 계정 승인  |
| PUT    | `/api/admin/users/{id}/status`  | 상태 변경  |

---

## 🐳 Docker

### 빌드

```bash
docker build -t bizsync-backend .
```

### 실행

```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mariadb://host:3306/bizsync_db \
  -e SPRING_DATASOURCE_USERNAME=user \
  -e SPRING_DATASOURCE_PASSWORD=pass \
  -e JWT_SECRET=your-secret \
  bizsync-backend
```

---

## 🚢 CI/CD 배포

GitHub Actions로 `main` 브랜치 푸시 시 자동 배포:

1. Gradle 빌드 및 테스트
2. Docker 이미지 빌드
3. AWS ECR에 푸시
4. EC2에서 docker compose pull && up

### 배포 전 체크리스트

```bash
# 로컬에서 빌드 확인
./gradlew build

# 테스트 실행
./gradlew test
```

---

## 🧪 테스트

```bash
# 전체 테스트
./gradlew test

# 특정 테스트
./gradlew test --tests "ApprovalServiceTest"
```

---

## 📝 주요 설계 결정

### JPA + MyBatis 하이브리드

- **JPA**: 단순 CRUD, 엔티티 관계 관리
- **MyBatis**: 복잡한 조인 쿼리, N+1 문제 회피

### Spring AOP 권한 체크

- `@RequireProjectLeader`: 프로젝트 리더 권한 필요
- `@RequireProjectMember`: 프로젝트 멤버 권한 필요
- 비즈니스 로직과 권한 로직 분리

### 예산 차감 동시성

- 비관적 락 (`PESSIMISTIC_WRITE`)으로 Race Condition 방지
- 결재 승인 시 프로젝트 예산 정확히 차감

---

## 📄 라이선스

포트폴리오 목적으로 제작되었습니다.
