# BizSync 배포 가이드 (EC2 + RDS)

이 문서는 AWS EC2와 RDS를 사용한 BizSync 프로젝트 배포 가이드를 제공합니다.

## 📋 사전 준비사항

1. **AWS 계정 및 리소스**
   - EC2 인스턴스 (Ubuntu 22.04 LTS 권장)
   - RDS MariaDB 인스턴스
   - 보안 그룹 설정 (포트 80, 443, 8080, 3306)

2. **로컬 환경**
   - Docker 및 Docker Compose 설치
   - Git 클론

## 🚀 배포 단계

### 1. EC2 인스턴스 설정

#### 1.1 Docker 설치
```bash
# Docker 설치
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin

# Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
# 로그아웃 후 다시 로그인 필요
```

#### 1.2 프로젝트 클론
```bash
cd /home/ubuntu
git clone <your-repository-url> bizsync-project
cd bizsync-project
```

### 2. 환경 변수 설정

#### 2.1 `.env` 파일 생성
```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env

# .env 파일 편집
nano .env
```

#### 2.2 환경 변수 설정 예시
```bash
# RDS 엔드포인트 (RDS 콘솔에서 확인)
SPRING_DATASOURCE_URL=jdbc:mariadb://bizsync-db.xxxxx.ap-northeast-2.rds.amazonaws.com:3306/bizsync?serverTimezone=Asia/Seoul
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=your_secure_password

# JWT 시크릿 키 (강력한 랜덤 문자열 생성)
JWT_SECRET=your-secret-key-must-be-at-least-256-bits-long-for-HS256-algorithm-security

# CORS 설정 (실제 프론트엔드 도메인)
APP_CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Frontend 빌드 시 사용할 API URL
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_WS_URL=wss://api.your-domain.com/ws
```

### 3. RDS 데이터베이스 설정

#### 3.1 RDS 보안 그룹 설정
- EC2 인스턴스의 보안 그룹을 RDS의 인바운드 규칙에 추가
- 포트 3306 허용

#### 3.2 데이터베이스 초기화
```bash
# EC2에서 RDS에 연결하여 데이터베이스 생성
mysql -h <rds-endpoint> -u <username> -p

# MySQL/MariaDB에서 실행
CREATE DATABASE IF NOT EXISTS bizsync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bizsync;

# 마이그레이션 스크립트 실행 (필요시)
# source backend/src/main/resources/db/migration/index.sql
```

### 4. Docker 이미지 빌드 및 실행

#### 4.1 이미지 빌드
```bash
# 프로젝트 루트에서 실행
docker compose build
```

#### 4.2 컨테이너 실행
```bash
# 백그라운드로 실행
docker compose up -d

# 로그 확인
docker compose logs -f

# 특정 서비스 로그만 확인
docker compose logs -f backend
docker compose logs -f frontend
```

### 5. Nginx 리버스 프록시 설정 (선택사항)

프론트엔드와 백엔드를 같은 도메인에서 서비스하는 경우:

```nginx
# /etc/nginx/sites-available/bizsync
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 프론트엔드
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 백엔드 API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 6. SSL/TLS 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install -y certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

## 🔧 유지보수

### 컨테이너 재시작
```bash
# 전체 재시작
docker compose restart

# 특정 서비스만 재시작
docker compose restart backend
docker compose restart frontend
```

### 로그 확인
```bash
# 실시간 로그
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f backend
docker compose logs -f frontend

# 최근 100줄만 확인
docker compose logs --tail=100 backend
```

### 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker compose ps

# 리소스 사용량 확인
docker stats
```

### 업데이트 배포
```bash
# 코드 업데이트
git pull origin main

# 이미지 재빌드
docker compose build

# 컨테이너 재시작
docker compose up -d
```

## 🐛 문제 해결

### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :80
sudo lsof -i :8080

# 프로세스 종료
sudo kill -9 <PID>
```

### 데이터베이스 연결 실패
- RDS 보안 그룹에서 EC2 IP 허용 확인
- `.env` 파일의 RDS 엔드포인트 확인
- 데이터베이스 사용자 권한 확인

### 컨테이너 로그 확인
```bash
# 백엔드 로그
docker compose logs backend

# 프론트엔드 로그
docker compose logs frontend
```

## 📝 참고사항

1. **보안**
   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - JWT_SECRET은 강력한 랜덤 문자열을 사용하세요
   - RDS 비밀번호는 복잡하게 설정하세요

2. **모니터링**
   - CloudWatch를 사용하여 로그 모니터링
   - RDS 성능 인사이트 활용

3. **백업**
   - RDS 자동 백업 설정
   - 정기적인 데이터베이스 백업

4. **스케일링**
   - 로드 밸런서 사용 시 여러 EC2 인스턴스 배포 가능
   - RDS 읽기 전용 복제본 활용
