# BizSync - 기업형 프로젝트 협업 플랫폼

> 프로젝트 관리, 칸반 보드, 전자결재, 실시간 채팅을 통합한 팀 협업 솔루션

[![Deploy to AWS](https://github.com/parkote9212/bizsync-project/actions/workflows/deploy.yml/badge.svg)](https://github.com/parkote9212/bizsync-project/actions/workflows/deploy.yml)

## 🌐 Live Demo

**배포 URL**: [http://54.180.155.0](http://54.180.155.0)

### 🔐 Demo Account

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@bizsync.com | Admin123!@# |
| 일반 사용자 | test1@test.com | test1234 |
| 일반 사용자 | test2@test.com | test1234 |
| 일반 사용자 | test3@test.com | test1234 |

> ⚠️ 테스트용 계정입니다. 데이터는 주기적으로 초기화됩니다.

---

## 📋 프로젝트 개요

BizSync는 팀 협업을 위한 통합 프로젝트 관리 솔루션으로, 다음 기능을 제공합니다:

- **프로젝트 관리**: 프로젝트 생성/수정/조회, 멤버 초대, 프로젝트 권한(PL 등) 관리
- **칸반 보드**: Drag & Drop 업무 이동, WebSocket(STOMP) 기반 실시간 동기화
- **결재 시스템**: 다단계 결재 라인, 예산 결재(프로젝트 예산 차감), Redis/Redisson 분산 락으로 동시성 제어
- **알림**: 결재/프로젝트 이벤트 기반 실시간 알림(WebSocket)
- **실시간 채팅**: WebSocket 기반 프로젝트별 채팅방 + 접속 상태(presence) 관리
- **대시보드**: 개인/관리자 통계 제공, Redis 캐시 기반 응답 최적화
- **배치**: Spring Batch + 스케줄러로 프로젝트 아카이빙 자동화
- **운영/문서화**: Actuator 헬스체크/메트릭, SpringDoc(OpenAPI) 기반 Swagger UI

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐    ┌─────────────────────────────────────┐    │
│   │   GitHub    │    │           EC2 (t2.micro)            │    │
│   │   Actions   │───▶│  ┌─────────┐  ┌─────────────────┐   │    │
│   │   (CI/CD)   │    │  │  Nginx  │  │ Docker Compose  │   │    │
│   └─────────────┘    │  │ (Proxy) │  │ ┌─────────────┐ │   │    │
│         │            │  └────┬────┘  │ │  Frontend   │ │   │    │
│         │            │       │       │ │  (React)    │ │   │    │
│         ▼            │       │       │ └─────────────┘ │   │    │
│   ┌─────────────┐    │       │       │ ┌─────────────┐ │   │    │
│   │     ECR     │    │       └──────▶│ │  Backend    │ │   │    │
│   │  (Registry) │───▶│               │ │ (Spring)    │ │   │    │
│   └─────────────┘    │               │ └──────┬──────┘ │   │    │
│                      │               │        │        │   │    │
│                      │               │  ┌─────▼─────┐  │   │    │
│                      │               │  │   Redis   │  │   │    │
│                      │               │  │ (Cache/   │  │   │    │
│                      │               │  │  Lock)    │  │   │    │
│                      │               │  └───────────┘  │   │    │
│                      │               └────────┼────────┘   │    │
│                      └────────────────────────┼────────────┘    │
│                                               │                  │
│                      ┌────────────────────────▼────────────┐    │
│                      │         RDS (MariaDB 10.11)         │    │
│                      │     bizsync-db.xxx.rds.amazonaws    │    │
│                      └─────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

- **요청 흐름**: 브라우저 → Nginx → Frontend 정적 서빙 / Backend API(`/api`) 라우팅
- **실시간 통신**: Frontend ↔ Backend WebSocket(STOMP, `/ws`)
- **Redis**: 캐시(프로젝트/권한/대시보드) + 분산 락(결재 동시성 제어)
- **배치**: Spring Batch + 스케줄러(`@Scheduled`)로 프로젝트 아카이빙 실행

---

## 🛠️ 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Java | 21 | 언어 (Virtual Threads 지원) |
| Spring Boot | 3.5.9 | 프레임워크 |
| Spring Security + JWT | - | 인증/인가 (Access/Refresh) |
| Spring WebSocket (STOMP) | - | 실시간 통신 |
| Spring Data JPA | - | ORM (단순 CRUD) |
| MyBatis | 3.0.5 | 복잡한 조회/조인 최적화 |
| Spring Batch | - | 배치 작업 (프로젝트 아카이빙 등) |
| Redis + Redisson | 4.1.0 | 캐시/분산 락 |
| Spring AOP | - | 횡단 관심사 분리 |
| Spring Actuator | - | 헬스체크/메트릭 |
| SpringDoc OpenAPI | 2.8.3 | Swagger UI / API 문서 |
| JJWT | 0.12.3 | JWT 생성/검증 |
| Apache POI | 5.4.0 | Excel 처리 |

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2.0 | UI 라이브러리 |
| TypeScript | 5.9.3 | 타입 안정성 |
| Vite | 7.2.4 | 빌드 도구 |
| Material-UI (MUI) | 7.3.7 | UI 컴포넌트 |
| React Router | 7.12.0 | 라우팅 |
| Axios | 1.13.2 | HTTP 클라이언트 |
| @stomp/stompjs | 7.2.1 | WebSocket(STOMP) 클라이언트 |
| Zustand | 5.0.10 | 상태 관리 |
| Recharts | 3.7.0 | 차트 |
| @hello-pangea/dnd | 18.0.1 | Drag & Drop |

### Infrastructure
| 기술 | 용도 |
|------|------|
| AWS EC2 | 애플리케이션 서버 |
| AWS RDS | MariaDB 데이터베이스 |
| AWS ECR | Docker 이미지 레지스트리 |
| GitHub Actions | CI/CD 파이프라인 |
| Docker & Docker Compose | 컨테이너화 |
| Nginx | 리버스 프록시 |

---

## 📁 프로젝트 구조

```
bizsync-project/
├── backend/                    # Spring Boot 백엔드
│   ├── src/main/java/
│   │   └── com/bizsync/backend/
│   │       ├── domain/         # 도메인 모듈(DDD): approval/project/user/notification/dashboard
│   │       ├── global/         # 전역 설정/공통 모듈(config/common/security)
│   │       └── batch/          # 배치 작업(job/scheduler)
│   └── Dockerfile
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── api/               # API 클라이언트
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── stores/            # Zustand 스토어
│   │   └── types/             # TypeScript 타입
│   └── Dockerfile
├── .github/workflows/         # GitHub Actions CI/CD
│   └── deploy.yml
├── docker-compose.yml         # 프로덕션 Docker Compose
├── docker-compose.local.yml   # 로컬 개발용
└── nginx.conf                 # Nginx 설정
```

---

## 🚀 빠른 시작

### 사전 요구사항

- **Java 21** (백엔드)
- **Node.js 18+** 및 **npm** (프론트엔드)
- **Docker** 및 **Docker Compose**
- **MariaDB 10.11+** 또는 **MySQL 8.0+**

### 로컬 개발 환경 설정

#### 1. 저장소 클론

```bash
git clone https://github.com/parkote9212/bizsync-project.git
cd bizsync-project
```

#### 2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일 편집
```

#### 3. Docker Compose로 실행 (권장)

```bash
docker compose -f docker-compose.local.yml up -d
```

#### 4. 개별 실행 (개발 모드)

**백엔드:**
```bash
cd backend
./gradlew bootRun
```

**프론트엔드:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `SPRING_DATASOURCE_URL` | DB 연결 URL | `jdbc:mariadb://localhost:3306/bizsync` |
| `SPRING_DATASOURCE_USERNAME` | DB 사용자명 | `root` |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 | `password` |
| `JWT_SECRET` | JWT 서명 키 (256비트 이상) | `your-secret-key...` |
| `APP_CORS_ALLOWED_ORIGINS` | CORS 허용 도메인 | `http://localhost:5173` |
| `ADMIN_EMAIL` | 초기 관리자 이메일 | `admin@bizsync.com` |
| `ADMIN_PASSWORD` | 초기 관리자 비밀번호 | `Admin123!@#` |

---

## 🚢 CI/CD 배포

### GitHub Actions 자동 배포

`main` 브랜치에 푸시하면 자동으로 배포됩니다:

1. **Build**: 프론트엔드/백엔드 빌드 및 테스트
2. **Push**: Docker 이미지를 AWS ECR에 푸시
3. **Deploy**: EC2에서 최신 이미지로 컨테이너 재시작

### 수동 배포

```bash
# EC2 접속
ssh -i your-key.pem ec2-user@54.180.155.0

# 최신 이미지 풀 및 재시작
cd /home/ec2-user/bizsync
docker compose pull
docker compose up -d
```

---

## 📚 주요 API 엔드포인트

| 카테고리 | Method | URL | 설명 |
|----------|--------|-----|------|
| 인증 | POST | `/api/auth/login` | 로그인 |
| 인증 | POST | `/api/auth/signup` | 회원가입 |
| 프로젝트 | GET | `/api/projects` | 프로젝트 목록 |
| 칸반 | GET | `/api/projects/{id}/board` | 보드 조회 |
| 결재 | POST | `/api/approvals` | 결재 기안 |

---

## 📝 주요 기능

### 인증 및 권한
- JWT 기반 인증 (Access Token + Refresh Token)
- 역할 기반 접근 제어 (ADMIN, MEMBER)
- 프로젝트별 권한 관리 (PL, MEMBER)
- Spring AOP 기반 권한 체크 (`@RequireProjectLeader`)

### 칸반 보드
- Drag & Drop 업무 이동
- WebSocket 실시간 동기화
- 낙관적 업데이트 (Optimistic UI)
- 컬럼 생성/삭제 (PL 권한)

### 결재 시스템
- 다단계 결재 라인
- 예산 결재 시 프로젝트 예산 차감
- Redis/Redisson 분산 락으로 동시성 제어 (동시 승인/반려 경쟁 상태 방지)

---

## 🧪 테스트

```bash
# 백엔드 테스트
cd backend && ./gradlew test

# 프론트엔드 린트
cd frontend && npm run lint
```

---

## 📄 문서

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Notion 개발 문서](https://www.notion.so/2e9800a6a897803fa490f6a061179510)

---

## 👤 개발자

**G.C.Park** - 풀스택 개발

- GitHub: [@parkote9212](https://github.com/parkote9212)

---

## 📄 라이선스

이 프로젝트는 포트폴리오 목적으로 제작되었습니다.
