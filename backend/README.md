# BizSync Backend

BizSync의 백엔드 서버입니다. Spring Boot 기반의 RESTful API와 WebSocket을 제공합니다.

## 기술 스택

- **Java 21**
- **Spring Boot 3.5.9**
- **Spring Security** - 인증 및 권한 관리
- **Spring Data JPA** - 데이터베이스 ORM
- **MyBatis** - 복잡한 쿼리 처리
- **Spring WebSocket (STOMP)** - 실시간 통신
- **JWT (JSON Web Token)** - 토큰 기반 인증
- **MariaDB** - 관계형 데이터베이스
- **Apache POI** - Excel 파일 처리
- **SpringDoc OpenAPI** - API 문서화 (Swagger)

## 주요 기능

### 인증 및 보안
- JWT 기반 인증 (Access Token + Refresh Token)
- Spring Security를 통한 엔드포인트 보호
- 역할 기반 접근 제어 (ADMIN, MEMBER)
- 프로젝트별 권한 검증 (LEADER, MEMBER)

### 프로젝트 관리
- 프로젝트 CRUD 작업
- 프로젝트 멤버 초대 및 관리
- 프로젝트 설정 및 상태 관리

### 칸반 보드
- 컬럼 및 업무 관리
- 업무 이동 및 순서 변경
- WebSocket을 통한 실시간 보드 동기화
- 업무 담당자 및 마감일 관리

### 결재 시스템
- 결재 문서 생성 및 관리
- 다단계 결재 라인 설정
- 결재 상태 추적 및 알림
- Excel 내보내기 기능

### 채팅
- WebSocket 기반 실시간 메시징
- 프로젝트별 채팅방 관리

### 대시보드
- 프로젝트 통계 및 현황 조회

## 프로젝트 구조

```
src/main/java/com/bizsync/backend/
├── BackendApplication.java          # 메인 애플리케이션 클래스
├── common/                          # 공통 설정 및 유틸리티
│   ├── annotation/                 # 커스텀 어노테이션
│   │   ├── RequireProjectLeader.java
│   │   └── RequireProjectMember.java
│   ├── config/                      # 설정 클래스
│   │   ├── SecurityConfig.java     # Spring Security 설정
│   │   ├── SwaggerConfig.java      # Swagger 설정
│   │   ├── WebSocketConfig.java    # WebSocket 설정
│   │   └── WebSocketEventListener.java
│   ├── exception/                  # 예외 처리
│   │   ├── GlobalExceptionHandler.java
│   │   └── UnauthenticatedException.java
│   ├── filter/                     # 필터
│   │   └── JwtAuthenticationFilter.java
│   └── util/                        # 유틸리티
│       ├── JwtProvider.java        # JWT 토큰 생성/검증
│       └── SecurityUtil.java       # 보안 유틸리티
├── controller/                      # REST 컨트롤러
│   ├── ApprovalController.java     # 결재 API
│   ├── AuthController.java         # 인증 API
│   ├── ChatController.java         # 채팅 API
│   ├── DashboardController.java    # 대시보드 API
│   ├── KanbanController.java       # 칸반 보드 API
│   ├── ProjectController.java      # 프로젝트 API
│   └── UserController.java         # 사용자 API
├── domain/                          # 도메인 모델
│   ├── entity/                     # JPA 엔티티
│   └── repository/                 # JPA 리포지토리
├── dto/                             # 데이터 전송 객체
│   ├── request/                    # 요청 DTO
│   └── response/                   # 응답 DTO
├── mapper/                          # MyBatis 매퍼
│   └── ProjectMapper.java
└── service/                         # 비즈니스 로직
    ├── ApprovalService.java
    ├── AuthService.java
    ├── ChatService.java
    ├── ExcelService.java
    ├── KanbanService.java
    ├── NotificationService.java
    ├── ProjectSecurityService.java
    └── ProjectService.java
```

## 빠른 시작

### 요구 사항

- **Java 21** 이상
- **Gradle 8.0+** (Gradle Wrapper 포함)
- **MariaDB 10.11+** 또는 **MySQL 8.0+**

### 설치 및 실행

#### 1. 데이터베이스 설정

루트 디렉토리의 `create.sql` 파일을 실행하여 데이터베이스 스키마를 생성합니다:

```bash
mysql -u root -p < ../create.sql
```

#### 2. 환경 변수 설정

`src/main/resources/application-dev.yml` 또는 환경 변수를 통해 데이터베이스 연결 정보를 설정합니다:

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/bizsync_db?serverTimezone=Asia/Seoul
    username: your_username
    password: your_password
    driver-class-name: org.mariadb.jdbc.Driver

jwt:
  secret: your-secret-key-must-be-at-least-256-bits-long
  expiration-ms: 3600000  # 1시간
  refresh-expiration-ms: 604800000  # 7일

app:
  cors:
    allowed-origins: http://localhost:5173,http://localhost:3000
```

#### 3. 애플리케이션 실행

```bash
# Gradle Wrapper 사용
./gradlew bootRun

# Windows
gradlew.bat bootRun

# 또는 IDE에서 BackendApplication.java 실행
```

기본적으로 `http://localhost:8080`에서 실행됩니다.

### Docker로 실행

```bash
# Docker 이미지 빌드
docker build -t bizsync-backend .

# 컨테이너 실행
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mariadb://host.docker.internal:3306/bizsync_db \
  -e SPRING_DATASOURCE_USERNAME=your_username \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  -e JWT_SECRET=your-secret-key \
  bizsync-backend
```

## API 엔드포인트

### 인증

- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/signup` - 회원가입

### 프로젝트

- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/{id}` - 프로젝트 상세 조회
- `PUT /api/projects/{id}` - 프로젝트 수정
- `DELETE /api/projects/{id}` - 프로젝트 삭제
- `POST /api/projects/{id}/invite` - 프로젝트 멤버 초대

### 칸반 보드

- `GET /api/projects/{projectId}/board` - 칸반 보드 조회
- `POST /api/projects/{projectId}/columns` - 컬럼 생성
- `PUT /api/projects/{projectId}/columns/{columnId}` - 컬럼 수정
- `DELETE /api/projects/{projectId}/columns/{columnId}` - 컬럼 삭제
- `POST /api/projects/{projectId}/tasks` - 업무 생성
- `PUT /api/projects/{projectId}/tasks/{taskId}` - 업무 수정
- `DELETE /api/projects/{projectId}/tasks/{taskId}` - 업무 삭제
- `PUT /api/projects/{projectId}/tasks/{taskId}/move` - 업무 이동

### 결재

- `GET /api/approvals` - 결재 문서 목록 조회
- `POST /api/approvals` - 결재 문서 생성
- `GET /api/approvals/{id}` - 결재 문서 상세 조회
- `POST /api/approvals/{id}/process` - 결재 처리
- `GET /api/approvals/{id}/export` - Excel 내보내기

### 채팅

- `GET /api/chat/rooms/{roomId}/messages` - 채팅 메시지 조회
- `POST /api/chat/rooms/{roomId}/messages` - 채팅 메시지 전송

### 대시보드

- `GET /api/dashboard` - 대시보드 데이터 조회

### 사용자

- `GET /api/users/me` - 현재 사용자 정보 조회
- `PUT /api/users/me/password` - 비밀번호 변경

## WebSocket 엔드포인트

### STOMP 메시징

- **구독 경로**: `/topic/projects/{projectId}/board` - 칸반 보드 변경사항 구독
- **발행 경로**: `/app/projects/{projectId}/board` - 칸반 보드 변경사항 발행
- **구독 경로**: `/user/{userId}/notifications` - 사용자 알림 구독

## 인증 방식

### JWT 토큰

1. 로그인 시 `accessToken`과 `refreshToken`을 발급받습니다.
2. API 요청 시 `Authorization: Bearer <accessToken>` 헤더를 포함합니다.
3. Access Token이 만료되면 Refresh Token으로 갱신합니다.

### 권한 검증

- `@RequireProjectLeader`: 프로젝트 리더 권한 필요
- `@RequireProjectMember`: 프로젝트 멤버 권한 필요

## 데이터베이스

### 주요 테이블

- `users` - 사용자 정보
- `project` - 프로젝트 정보
- `project_member` - 프로젝트 멤버 관계
- `kanban_column` - 칸반 컬럼
- `task` - 업무
- `approval_document` - 결재 문서
- `approval_line` - 결재 라인
- `chat_message` - 채팅 메시지

### 마이그레이션

데이터베이스 스키마 변경은 `src/main/resources/db/migration/` 디렉토리에 SQL 파일로 관리됩니다.

## 테스트

```bash
# 전체 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests ApprovalServiceTest

# 테스트 리포트 확인
./gradlew test --info
```

## 빌드

```bash
# JAR 파일 빌드
./gradlew build

# 빌드된 JAR 파일 실행
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

## 프로파일

- `dev`: 개발 환경 (기본값)
- `prod`: 프로덕션 환경

프로파일은 `application.yml`에서 설정하거나 환경 변수 `SPRING_PROFILES_ACTIVE`로 지정할 수 있습니다.

## Swagger UI

애플리케이션 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui.html
```

## 문제 해결

### 데이터베이스 연결 실패

- 데이터베이스 서버가 실행 중인지 확인
- `application-dev.yml`의 데이터베이스 연결 정보 확인
- 방화벽 설정 확인

### 포트 충돌

- 기본 포트 8080이 사용 중인 경우 `application.yml`에서 `server.port` 변경

### JWT 토큰 오류

- `JWT_SECRET` 환경 변수가 설정되어 있는지 확인
- 토큰 만료 시간 확인

## 개발 가이드

### 새로운 API 추가

1. `controller` 패키지에 컨트롤러 클래스 생성
2. `service` 패키지에 서비스 클래스 생성
3. `dto` 패키지에 요청/응답 DTO 생성
4. 필요시 `entity` 및 `repository` 추가

### 예외 처리

- 비즈니스 로직 예외는 `GlobalExceptionHandler`에서 처리
- 인증 예외는 `UnauthenticatedException` 사용

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
