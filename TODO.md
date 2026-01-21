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

## 🚨 필수 (CRITICAL)

배포 전 반드시 완료해야 하는 항목입니다.

### 1. Frontend 환경 변수 (난이도: ⭐)

> ⚠️ Backend는 이미 `.env` + `application-dev.yml`로 환경변수 분리 완료

#### 1.1 API URL 환경 변수화 ✅ 필수
- **현재 상태**: `client.ts`에 하드코딩
  ```typescript
  const BASE_URL = "http://localhost:8080/api";
  ```
- **작업 내용**:
  ```typescript
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
  ```
- **파일**: `frontend/src/api/client.ts`

#### 1.2 WebSocket URL 환경 변수화 ✅ 필수
- **현재 상태**: 하드코딩 (`ws://localhost:8080/ws`)
- **작업 내용**:
  ```typescript
  const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
  
  client.current = new Client({
    brokerURL: WS_URL,
    // ...
  });
  ```
- **파일**:
  - `frontend/src/hooks/useBoardSocket.ts`
  - `frontend/src/hooks/useNotificationSocket.ts`

#### 1.3 환경 변수 파일 생성 ✅ 필수
- **작업 내용**:
  ```bash
  # frontend/.env.example (Git 커밋용)
  VITE_API_BASE_URL=http://localhost:8080/api
  VITE_WS_URL=ws://localhost:8080/ws
  
  # frontend/.env.production (배포용, gitignore)
  VITE_API_BASE_URL=https://api.your-domain.com/api
  VITE_WS_URL=wss://api.your-domain.com/ws
  ```

---

### 2. 프로덕션 설정 (난이도: ⭐⭐)

#### 2.1 application-prod.yml 생성 ✅ 필수
- **현재 상태**: `application-dev.yml`만 존재
- **작업 내용**: `backend/src/main/resources/application-prod.yml` 생성
  ```yaml
  spring:
    application:
      name: BizSync
  
    datasource:
      driver-class-name: ${SPRING_DATASOURCE_DRIVER}
      url: ${SPRING_DATASOURCE_URL}
      username: ${SPRING_DATASOURCE_USERNAME}
      password: ${SPRING_DATASOURCE_PASSWORD}
  
    jpa:
      hibernate:
        ddl-auto: validate  # ❗ update → validate
      show-sql: false       # ❗ 프로덕션에서는 false
      properties:
        hibernate:
          format_sql: false
          dialect: org.hibernate.dialect.MariaDBDialect
  
  app:
    jwt:
      secret: ${JWT_SECRET}
      expiration-ms: ${JWT_EXPIRATION_MS:3600000}
      refresh-expiration-ms: ${JWT_REFRESH_EXPIRATION_MS:604800000}
  
  server:
    port: ${SERVER_PORT:8080}
  
  logging:
    level:
      root: WARN
      com.bizsync.backend: INFO
    file:
      name: logs/bizsync.log
  ```

#### 2.2 CORS 프로덕션 도메인 추가 ✅ 필수
- **현재 상태**: localhost만 허용
  ```java
  config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
  ```
- **작업 내용**: 환경 변수로 관리
  ```java
  @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
  private String allowedOrigins;
  
  // corsConfigurationSource에서
  config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
  ```
- **파일**: `backend/src/main/java/com/bizsync/backend/common/config/SecurityConfig.java`

---

### 3. Docker 컨테이너화 (난이도: ⭐⭐)

#### 3.1 Backend Dockerfile ✅ 필수
- **파일**: `backend/Dockerfile`
  ```dockerfile
  # Build Stage
  FROM eclipse-temurin:21-jdk-alpine AS build
  WORKDIR /app
  COPY gradlew .
  COPY gradle gradle
  COPY build.gradle settings.gradle ./
  COPY src src
  RUN chmod +x ./gradlew && ./gradlew bootJar --no-daemon
  
  # Run Stage
  FROM eclipse-temurin:21-jre-alpine
  WORKDIR /app
  COPY --from=build /app/build/libs/*.jar app.jar
  
  EXPOSE 8080
  ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
  ```

#### 3.2 Frontend Dockerfile ✅ 필수
- **파일**: `frontend/Dockerfile`
  ```dockerfile
  # Build Stage
  FROM node:20-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  
  # Run Stage
  FROM nginx:alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

#### 3.3 Nginx 설정 ✅ 필수
- **파일**: `frontend/nginx.conf`
  ```nginx
  server {
      listen 80;
      server_name localhost;
      root /usr/share/nginx/html;
      index index.html;
  
      # SPA 라우팅 지원
      location / {
          try_files $uri $uri/ /index.html;
      }
  
      # API 프록시 (선택)
      location /api/ {
          proxy_pass http://backend:8080/api/;
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  
      # WebSocket 프록시
      location /ws {
          proxy_pass http://backend:8080/ws;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
      }
  }
  ```

#### 3.4 docker-compose.yml ✅ 필수
- **파일**: `docker-compose.yml` (프로젝트 루트)
  ```yaml
  version: '3.8'
  
  services:
    backend:
      build: ./backend
      ports:
        - "8080:8080"
      environment:
        - SPRING_DATASOURCE_URL=jdbc:mariadb://db:3306/bizsync?serverTimezone=Asia/Seoul
        - SPRING_DATASOURCE_USERNAME=bizsync
        - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
        - JWT_SECRET=${JWT_SECRET}
        - SPRING_PROFILES_ACTIVE=prod
      depends_on:
        - db
      networks:
        - bizsync-network
  
    frontend:
      build:
        context: ./frontend
        args:
          - VITE_API_BASE_URL=http://localhost:8080/api
          - VITE_WS_URL=ws://localhost:8080/ws
      ports:
        - "80:80"
      depends_on:
        - backend
      networks:
        - bizsync-network
  
    db:
      image: mariadb:10.11
      environment:
        - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
        - MYSQL_DATABASE=bizsync
        - MYSQL_USER=bizsync
        - MYSQL_PASSWORD=${DB_PASSWORD}
      volumes:
        - db-data:/var/lib/mysql
      networks:
        - bizsync-network
  
  volumes:
    db-data:
  
  networks:
    bizsync-network:
      driver: bridge
  ```

---

## 💡 권장 (RECOMMENDED)

운영 안정성을 위해 구현을 권장하는 항목입니다.

### 4. UI 보완 (난이도: ⭐⭐)

#### 4.1 비밀번호 변경 UI 🔧 권장
- **현재 상태**: Backend API 구현됨 (`POST /api/auth/change-password`)
- **작업 내용**: 프로필 메뉴 또는 설정 페이지에 비밀번호 변경 UI 추가
- **구현 위치**: `Layout.tsx` 프로필 메뉴 또는 새로운 `SettingsPage.tsx`
- **API 연동**:
  ```typescript
  await client.post('/auth/change-password', {
    currentPassword: '현재 비밀번호',
    newPassword: '새 비밀번호'
  });
  ```

---

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

### 6. 데이터베이스 (난이도: ⭐⭐)

#### 6.1 인덱스 추가 🔧 권장
- **작업 내용**:
  ```sql
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_project_member_user ON project_member(user_id);
  CREATE INDEX idx_project_member_project ON project_member(project_id);
  CREATE INDEX idx_task_worker ON task(worker_id);
  CREATE INDEX idx_task_column ON task(column_id);
  CREATE INDEX idx_approval_line_approver ON approval_line(approver_id, status);
  ```

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

## 🎨 선택 (OPTIONAL)

시간 여유가 있을 때 구현하면 좋은 항목입니다.

### 8. 추가 기능

#### 8.1 결재 취소 기능 🎯 선택
- **목적**: 기안자가 PENDING 상태의 결재를 취소
- **Backend**: `ApprovalService.cancelApproval()`
- **Frontend**: 기안함에서 취소 버튼 추가

#### 8.2 이메일 알림 🎯 선택
- **목적**: 결재 요청/승인/반려 시 이메일 발송
- **도구**: Spring Mail, AWS SES

#### 8.3 PWA 지원 🎯 선택
- **목적**: 모바일 앱처럼 설치 가능
- **작업**: Service Worker, manifest.json

---

## 📊 우선순위 매트릭스

| 항목 | 난이도 | 중요도 | 예상 시간 | 우선순위 |
|-----|--------|--------|-----------|---------|
| Frontend API URL 환경변수 | ⭐ | 🔥🔥🔥 | 20분 | 1 |
| Frontend WebSocket URL 환경변수 | ⭐ | 🔥🔥🔥 | 20분 | 1 |
| Frontend .env 파일 생성 | ⭐ | 🔥🔥🔥 | 10분 | 1 |
| application-prod.yml | ⭐ | 🔥🔥🔥 | 30분 | 1 |
| CORS 프로덕션 설정 | ⭐ | 🔥🔥🔥 | 20분 | 1 |
| Backend Dockerfile | ⭐⭐ | 🔥🔥🔥 | 1시간 | 2 |
| Frontend Dockerfile | ⭐⭐ | 🔥🔥🔥 | 1시간 | 2 |
| docker-compose.yml | ⭐⭐ | 🔥🔥🔥 | 1시간 | 2 |
| 비밀번호 변경 UI | ⭐⭐ | 🔥🔥 | 2시간 | 3 |
| 관리자 기능 | ⭐⭐⭐ | 🔥🔥 | 1일 | 4 |
| 테스트 코드 | ⭐⭐⭐ | 🔥🔥 | 2일 | 4 |

---

## ✅ 배포 전 체크리스트

### 필수 체크 (Frontend)
- [ ] API URL 환경 변수화 완료
- [ ] WebSocket URL 환경 변수화 완료
- [ ] `.env.example` 파일 생성 완료
- [ ] `.env.production` 파일 생성 완료

### 필수 체크 (Backend)
- [x] 환경 변수 분리 완료 (`.env` + `application-dev.yml`)
- [ ] `application-prod.yml` 생성 완료
- [ ] CORS 프로덕션 도메인 설정 완료

### 필수 체크 (Docker)
- [ ] Backend Dockerfile 작성 완료
- [ ] Frontend Dockerfile 작성 완료
- [ ] nginx.conf 작성 완료
- [ ] docker-compose.yml 작성 완료

### 배포 후 확인
- [ ] 로그인/회원가입 테스트
- [ ] 프로젝트 생성/수정/삭제 테스트
- [ ] 칸반 보드 드래그앤드롭 테스트
- [ ] WebSocket 실시간 동기화 테스트
- [ ] 결재 프로세스 테스트
- [ ] 에러 로그 모니터링

---

## 🔄 업데이트 로그

| 날짜 | 작성자 | 변경 내용 |
|-----|--------|----------|
| 2026-01-22 | AI Assistant | 초기 TODO 리스트 작성 |
| 2026-01-22 | AI Assistant | 구현 완료 현황 추가, Backend 환경변수 분리 완료 반영 |
