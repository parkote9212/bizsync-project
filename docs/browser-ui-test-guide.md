# 브라우저 UI 통합 테스트 가이드

## 테스트 환경 준비

### 1. 서버 실행 확인

```bash
# 1) Next.js 프론트엔드 실행 확인
# 브라우저에서 다음 중 하나로 접속:
http://localhost:3000
# 또는
http://localhost:3001

# 2) Spring Boot 백엔드 실행 확인
curl http://localhost:8080/actuator/health

# 3) Redis 실행 확인
redis-cli ping

# 4) Kafka 실행 확인
docker ps | grep kafka
```

### 2. 테스트 계정

| 항목 | 값 |
|------|-----|
| **Email** | test1@test.com |
| **Password** | password |
| **이름** | 박사원 |
| **부서** | 개발팀 |
| **직급** | 사원 |
| **User ID** | 2 |

---

## 테스트 시나리오

### 시나리오 1: 로그인 플로우

#### 테스트 단계

1. **로그인 페이지 접속**
   ```
   http://localhost:3000/login
   ```

2. **UI 요소 확인**
   - [ ] "BizSync" 로고 표시
   - [ ] "기업 협업 플랫폼" 부제목 표시
   - [ ] 이메일 입력 필드
   - [ ] 비밀번호 입력 필드
   - [ ] "로그인" 버튼
   - [ ] "Google로 로그인" 버튼
   - [ ] "GitHub로 로그인" 버튼
   - [ ] "Kakao로 로그인" 버튼
   - [ ] "회원가입" 링크

3. **로그인 수행**
   - Email: `test1@test.com`
   - Password: `password`
   - "로그인" 버튼 클릭

4. **성공 확인**
   - [ ] URL이 `/dashboard`로 변경
   - [ ] 대시보드 페이지 표시
   - [ ] 로딩 상태 없음 (스피너 사라짐)

5. **개발자 도구 확인 (F12)**

   **Application → Local Storage → http://localhost:3000**
   - [ ] `accessToken` 키 존재 확인
   - [ ] `refreshToken` 키 존재 확인
   - [ ] 토큰 값이 `eyJ`로 시작 (JWT 형식)

   **Console 탭**
   - [ ] 에러 메시지 없음
   - [ ] 경고 메시지 없음 (또는 무시 가능한 경고만)

   **Network 탭**
   - [ ] `POST /api/auth/login` 요청 확인
   - [ ] Status: 200 OK
   - [ ] Response에 `accessToken`, `refreshToken` 포함

---

### 시나리오 2: 로그인 실패 처리

#### 테스트 단계

1. **잘못된 비밀번호로 로그인 시도**
   - Email: `test1@test.com`
   - Password: `wrongpassword`
   - "로그인" 버튼 클릭

2. **에러 메시지 확인**
   - [ ] 빨간색 에러 박스 표시
   - [ ] "비밀번호가 일치하지 않습니다" 메시지 표시
   - [ ] URL은 `/login`에 그대로 유지
   - [ ] localStorage에 토큰 저장 안 됨

3. **존재하지 않는 이메일로 로그인 시도**
   - Email: `nonexistent@test.com`
   - Password: `password`
   - "로그인" 버튼 클릭

4. **에러 메시지 확인**
   - [ ] 에러 메시지 표시 (사용자를 찾을 수 없음)
   - [ ] URL은 `/login`에 그대로 유지

---

### 시나리오 3: 인증된 API 호출

#### 전제 조건
- 로그인 완료 상태
- localStorage에 `accessToken` 저장됨

#### 테스트 단계

1. **개발자 도구 열기 (F12)**
   - Network 탭 선택
   - "Preserve log" 체크

2. **알림 페이지 이동**
   ```
   http://localhost:3000/notifications
   ```

3. **Network 탭에서 API 요청 확인**
   - [ ] `GET /api/notifications` 요청 확인
   - [ ] Request Headers에 `Authorization: Bearer eyJ...` 포함
   - [ ] Status: 200 OK
   - [ ] Response에 페이징 데이터 포함

---

### 시나리오 4: 토큰 만료 및 자동 갱신

#### 테스트 단계

1. **액세스 토큰 강제 만료**

   개발자 도구 Console에서 실행:
   ```javascript
   // 만료된 토큰으로 교체
   localStorage.setItem('accessToken', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyIiwicm9sZSI6Ik1FTUJFUiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid');
   ```

2. **API 호출 시도**
   - 페이지 새로고침 또는 알림 페이지 이동
   - Network 탭 확인

3. **자동 갱신 확인**
   - [ ] 첫 번째 요청: 401 Unauthorized
   - [ ] 자동으로 `POST /api/auth/refresh` 호출
   - [ ] 새로운 `accessToken` 발급
   - [ ] 원래 요청 재시도 및 성공

4. **localStorage 확인**
   - [ ] 새로운 `accessToken`으로 갱신됨
   - [ ] 새로운 `refreshToken`으로 갱신됨

---

### 시나리오 5: 로그아웃

#### 테스트 단계

1. **로그아웃 실행**

   개발자 도구 Console에서 실행:
   ```javascript
   localStorage.clear();
   window.location.href = '/login';
   ```

2. **확인**
   - [ ] localStorage 비어있음
   - [ ] `/login` 페이지로 이동
   - [ ] 인증이 필요한 페이지 접근 시 `/login`으로 리다이렉트

---

### 시나리오 6: OAuth2 소셜 로그인 버튼 클릭

#### 테스트 단계

1. **Google 로그인 버튼 클릭**
   - [ ] URL이 `http://localhost:8080/oauth2/authorization/google`로 변경 시도
   - [ ] 백엔드 OAuth2 설정이 안 되어 있어 에러 발생 (정상)

2. **GitHub 로그인 버튼 클릭**
   - [ ] URL이 `http://localhost:8080/oauth2/authorization/github`로 변경 시도

3. **Kakao 로그인 버튼 클릭**
   - [ ] URL이 `http://localhost:8080/oauth2/authorization/kakao`로 변경 시도

**참고**: OAuth2 실제 연동은 Phase 3.5에서 진행 예정이므로, 현재는 버튼만 표시되고 실제 로그인은 불가능합니다.

---

## 알려진 이슈 및 해결 방법

### 이슈 1: 포트 3000이 이미 사용 중

**증상**: Next.js가 포트 3001에서 실행됨

**해결**:
```bash
# 3000 포트 사용 프로세스 종료
lsof -ti:3000 | xargs kill -9

# Next.js 재시작
cd /Users/gcpark/code/bizsync-project/frontend-next
npm run dev
```

### 이슈 2: CORS 에러

**증상**: Network 탭에서 CORS 관련 에러 발생

**해결**: 백엔드 CORS 설정 확인
- `application-dev.yml`에서 `app.cors.allowed-origins` 확인
- `http://localhost:3000` 및 `http://localhost:3001` 포함 확인

### 이슈 3: 백엔드 연결 실패

**증상**: "서버 오류가 발생했습니다" 메시지

**해결**:
```bash
# 백엔드 실행 확인
curl http://localhost:8080/actuator/health

# 응답 없으면 IntelliJ에서 Spring Boot 애플리케이션 시작
```

---

## 자동화 테스트 스크립트 (선택사항)

### Playwright E2E 테스트 (향후 구현)

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('로그인 플로우 테스트', async ({ page }) => {
  // 1. 로그인 페이지 이동
  await page.goto('http://localhost:3000/login');

  // 2. UI 요소 확인
  await expect(page.locator('h1')).toContainText('BizSync');

  // 3. 로그인 수행
  await page.fill('input[type="email"]', 'test1@test.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');

  // 4. 대시보드로 리다이렉트 확인
  await expect(page).toHaveURL(/.*dashboard/);

  // 5. localStorage 토큰 확인
  const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
  expect(accessToken).toBeTruthy();
  expect(accessToken).toMatch(/^eyJ/);
});
```

---

## 체크리스트 요약

### 필수 테스트
- [ ] 로그인 성공 플로우
- [ ] 로그인 실패 처리 (잘못된 비밀번호)
- [ ] JWT 토큰 localStorage 저장 확인
- [ ] 인증된 API 호출 (Authorization 헤더)
- [ ] 대시보드 페이지 접근

### 선택적 테스트
- [ ] 토큰 자동 갱신 (401 → refresh → retry)
- [ ] 로그아웃 및 localStorage 클리어
- [ ] OAuth2 소셜 로그인 버튼 표시
- [ ] 에러 메시지 UI 표시
- [ ] 페이지 간 네비게이션

---

## 테스트 결과 보고 템플릿

```markdown
# 브라우저 UI 테스트 결과

**테스트 일시**: YYYY-MM-DD HH:MM
**테스터**: [이름]
**브라우저**: Chrome 123.0 / Safari 17.0 / Firefox 120.0
**환경**: macOS / Windows / Linux

## 테스트 결과

| 시나리오 | 결과 | 비고 |
|---------|------|------|
| 로그인 성공 | ✅ PASS | - |
| 로그인 실패 처리 | ✅ PASS | - |
| 인증된 API 호출 | ✅ PASS | - |
| 토큰 자동 갱신 | ⏸️ SKIP | 시간 제약 |
| OAuth2 버튼 표시 | ✅ PASS | 실제 연동은 미구현 |

## 발견된 버그
- 없음

## 개선 제안
- [제안 내용]
```

---

**작성일**: 2026-02-16
**Phase**: 4-2 통합 테스트
**상태**: 브라우저 UI 테스트 준비 완료
