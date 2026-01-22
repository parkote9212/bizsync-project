# BizSync

BizSync는 프로젝트 관리, 칸반 보드, 결재 시스템, 채팅 기능을 제공하는 협업 플랫폼입니다.

## 📋 프로젝트 개요

BizSync는 팀 협업을 위한 통합 프로젝트 관리 솔루션으로, 다음 기능을 제공합니다:

- **프로젝트 관리**: 프로젝트 생성, 멤버 초대, 권한 관리
- **칸반 보드**: 실시간 업무 관리 및 Drag & Drop 기능
- **결재 시스템**: 문서 기반 결재 프로세스
- **채팅**: 실시간 메시징
- **대시보드**: 프로젝트 현황 및 통계

## 🏗️ 아키텍처

```
bizsync-project/
├── backend/          # Spring Boot 백엔드 (Java 21)
├── frontend/         # React 프론트엔드 (TypeScript)
├── docker-compose.yml # Docker Compose 설정
└── create.sql        # 데이터베이스 스키마
```

## 🚀 빠른 시작

### 사전 요구사항

- **Java 21** (백엔드)
- **Node.js 18+** 및 **npm** (프론트엔드)
- **Docker** 및 **Docker Compose** (선택사항)
- **MariaDB 10.11+** 또는 **MySQL 8.0+**

### 로컬 개발 환경 설정

#### 1. 저장소 클론

```bash
git clone <repository-url>
cd bizsync-project
```

#### 2. 데이터베이스 설정

```bash
# MariaDB/MySQL에 데이터베이스 생성
mysql -u root -p < create.sql
```

#### 3. 백엔드 실행

```bash
cd backend

# 환경 변수 설정 (application-dev.yml 또는 .env)
# 데이터베이스 연결 정보, JWT 시크릿 등 설정

# Gradle로 실행
./gradlew bootRun

# 또는 IDE에서 BackendApplication.java 실행
```

백엔드는 기본적으로 `http://localhost:8080`에서 실행됩니다.

#### 4. 프론트엔드 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드는 기본적으로 `http://localhost:5173`에서 실행됩니다.

### Docker Compose로 실행

```bash
# .env 파일 생성 및 설정
cp .env.example .env
# .env 파일 편집 (데이터베이스 연결 정보, JWT 시크릿 등)

# 컨테이너 빌드 및 실행
docker compose up -d

# 로그 확인
docker compose logs -f
```

## 📁 프로젝트 구조

### Backend

- **Spring Boot 3.5.9** 기반 RESTful API
- **Spring Security** + **JWT** 인증
- **WebSocket (STOMP)** 실시간 통신
- **JPA** + **MyBatis** 하이브리드 ORM
- **MariaDB** 데이터베이스

자세한 내용은 [backend/README.md](./backend/README.md)를 참조하세요.

### Frontend

- **React 19** + **TypeScript**
- **Vite** 빌드 도구
- **Material-UI (MUI)** UI 컴포넌트
- **React Router DOM 7** 라우팅
- **Zustand** 상태 관리
- **WebSocket (STOMP)** 실시간 통신

자세한 내용은 [frontend/README.md](./frontend/README.md)를 참조하세요.

## 🔧 환경 변수

프로젝트 루트의 `.env.example` 파일을 참조하여 `.env` 파일을 생성하세요.

주요 환경 변수:

- `SPRING_DATASOURCE_URL`: 데이터베이스 연결 URL
- `SPRING_DATASOURCE_USERNAME`: 데이터베이스 사용자명
- `SPRING_DATASOURCE_PASSWORD`: 데이터베이스 비밀번호
- `JWT_SECRET`: JWT 토큰 서명 키
- `JWT_EXPIRATION_MS`: Access Token 만료 시간 (기본: 3600000ms = 1시간)
- `JWT_REFRESH_EXPIRATION_MS`: Refresh Token 만료 시간 (기본: 604800000ms = 7일)
- `APP_CORS_ALLOWED_ORIGINS`: CORS 허용 도메인 (쉼표로 구분)
- `VITE_API_BASE_URL`: 프론트엔드에서 사용할 API Base URL
- `VITE_WS_URL`: 프론트엔드에서 사용할 WebSocket URL

## 📚 API 문서

백엔드 서버 실행 후 Swagger UI에서 API 문서를 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui.html
```

## 🚢 배포

AWS EC2 + RDS를 사용한 배포 가이드는 [DEPLOY.md](./DEPLOY.md)를 참조하세요.

## 🧪 테스트

### 백엔드 테스트

```bash
cd backend
./gradlew test
```

### 프론트엔드 테스트

```bash
cd frontend
npm run test
```

## 📝 주요 기능

### 인증 및 권한

- JWT 기반 인증 (Access Token + Refresh Token)
- 역할 기반 접근 제어 (ADMIN, MEMBER)
- 프로젝트별 권한 관리 (LEADER, MEMBER)

### 프로젝트 관리

- 프로젝트 CRUD
- 프로젝트 멤버 초대 및 관리
- 프로젝트 상태 관리 (IN_PROGRESS, COMPLETED, CANCELLED)

### 칸반 보드

- 컬럼 및 업무 생성/수정/삭제
- Drag & Drop으로 업무 이동
- 실시간 보드 동기화 (WebSocket)
- 업무 담당자 지정 및 마감일 설정

### 결재 시스템

- 결재 문서 생성 및 관리
- 다단계 결재 라인 설정
- 결재 상태 추적 (PENDING, APPROVED, REJECTED)
- Excel 내보내기 기능

### 채팅

- 실시간 메시징
- 프로젝트별 채팅방

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 👥 팀

BizSync 개발팀

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
