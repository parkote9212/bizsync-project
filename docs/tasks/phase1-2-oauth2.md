# Phase 1-2: OAuth2 인증 도입

## 브랜치

```bash
git checkout dev && git pull origin dev
git checkout -b feature/oauth2
```

---

## Task 1: OAuth2 의존성 추가

**파일**: `backend/build.gradle`

```groovy
// OAuth2 Client (소셜 로그인 플로우)
implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
// OAuth2 Resource Server (JWT 토큰 검증)
implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
```

**커밋**: `feat(oauth2): OAuth2 Client/Resource Server 의존성 추가`

---

## Task 2: OAuth2 Provider 설정

**파일**: `backend/src/main/resources/application-dev.yml`

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: email, profile
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: user:email, read:user
          kakao:
            client-id: ${KAKAO_CLIENT_ID}
            client-secret: ${KAKAO_CLIENT_SECRET}
            scope: profile_nickname, account_email
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/api/auth/oauth2/callback/kakao"
            client-authentication-method: client_secret_post
        provider:
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id
```

**커밋**: `feat(oauth2): Google/GitHub/Kakao OAuth2 Provider 설정`

---

## Task 3: UserOAuth 엔티티 생성

**파일**: `backend/src/.../domain/user/entity/OAuthProvider.java` (enum)
**파일**: `backend/src/.../domain/user/entity/UserOAuth.java` (엔티티)
**파일**: `backend/src/.../domain/user/repository/UserOAuthRepository.java`

**커밋**: `feat(oauth2): UserOAuth 엔티티 및 리포지토리 생성`

---

## Task 4: OAuth2UserService 구현

**파일**: `backend/src/.../domain/user/service/OAuth2UserService.java`

핵심 로직:
1. OAuth2 로그인 시 provider_id로 기존 UserOAuth 조회
2. 있으면 → 해당 User로 JWT 발급
3. 없으면 → email로 기존 User 매칭 시도 → UserOAuth 연동
4. 완전 신규 → User + UserOAuth 생성 (ACTIVE 상태)

**커밋**: `feat(oauth2): OAuth2UserService 로그인/연동 로직 구현`

---

## Task 5: OAuth2 Controller 추가

**파일**: `backend/src/.../domain/user/controller/OAuth2Controller.java`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/auth/oauth2/{provider}` | 리다이렉트 |
| GET | `/api/auth/oauth2/callback/{provider}` | 콜백 처리 |
| POST | `/api/auth/oauth2/link` | 계정 연동 |
| DELETE | `/api/auth/oauth2/unlink/{provider}` | 연동 해제 |
| GET | `/api/auth/oauth2/accounts` | 연동 목록 |

**커밋**: `feat(oauth2): OAuth2 API 엔드포인트 구현`

---

## Task 6: SecurityConfig 업데이트

**파일**: `backend/src/.../global/config/SecurityConfig.java`

- OAuth2 관련 엔드포인트 permitAll 추가
- 기존 JWT 필터와 OAuth2 병행 설정
- OAuth2 로그인 성공 핸들러 (JWT 발급)

**확인**:
- [ ] 기존 JWT 로그인 정상 동작
- [ ] OAuth2 로그인 플로우 동작
- [ ] 토큰 발급 후 API 접근 가능

**커밋**: `feat(oauth2): SecurityConfig OAuth2 설정 추가`

---

## Phase 1-2 완료 체크리스트

- [ ] OAuth2 의존성 추가
- [ ] Provider 설정 (Google, GitHub, Kakao)
- [ ] UserOAuth 엔티티/리포지토리
- [ ] OAuth2UserService 구현
- [ ] OAuth2Controller API 구현
- [ ] SecurityConfig 업데이트
- [ ] 기존 JWT 인증 깨지지 않음 확인
- [ ] OAuth2 로그인 → JWT 발급 동작 확인
- [ ] dev 브랜치 merge
