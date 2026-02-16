# WebSocket/STOMP 실시간 통신 테스트 가이드

## 개요

BizSync는 WebSocket과 STOMP 프로토콜을 사용하여 실시간 알림을 전송합니다.

- **WebSocket 엔드포인트**: `ws://localhost:8080/ws`
- **STOMP 프로토콜**: SockJS + STOMP over WebSocket
- **알림 구독 경로**: `/sub/notification/{userId}`

---

## 방법 1: 브라우저 개발자 도구 (권장)

### 1. 로그인 및 사용자 ID 확인

```javascript
// 브라우저 Console (F12)에서 실행

// 1. localStorage에서 사용자 정보 확인
const accessToken = localStorage.getItem('accessToken');
console.log('Access Token:', accessToken);

// 2. JWT 디코딩하여 사용자 ID 추출
const payload = JSON.parse(atob(accessToken.split('.')[1]));
console.log('User ID:', payload.sub);
```

### 2. SockJS + STOMP 클라이언트 설정

```javascript
// 브라우저 Console에서 실행

// SockJS 및 STOMP 라이브러리가 이미 로드되어 있다고 가정
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('WebSocket 연결 성공:', frame);

    // 사용자별 알림 구독
    const userId = 2; // 실제 사용자 ID로 변경
    stompClient.subscribe(`/sub/notification/${userId}`, function(message) {
        console.log('알림 수신:', JSON.parse(message.body));
    });

    console.log(`알림 구독 완료: /sub/notification/${userId}`);
}, function(error) {
    console.error('WebSocket 연결 실패:', error);
});

// 연결 해제
// stompClient.disconnect();
```

---

## 방법 2: Node.js 스크립트

### 1. 테스트 스크립트 생성

`test-websocket.js`:
```javascript
const SockJS = require('sockjs-client');
const Stomp = require('stompjs');

const WEBSOCKET_URL = 'http://localhost:8080/ws';
const USER_ID = 2; // 테스트 사용자 ID

console.log('WebSocket 연결 시도:', WEBSOCKET_URL);

const socket = new SockJS(WEBSOCKET_URL);
const stompClient = Stomp.over(socket);

// 디버그 로그 비활성화 (선택사항)
// stompClient.debug = null;

stompClient.connect({},
    (frame) => {
        console.log('✅ WebSocket 연결 성공');
        console.log('Frame:', frame);

        const destination = `/sub/notification/${USER_ID}`;
        console.log(`알림 구독 중: ${destination}`);

        stompClient.subscribe(destination, (message) => {
            console.log('\n🔔 새 알림 수신:');
            const notification = JSON.parse(message.body);
            console.log('  타입:', notification.type);
            console.log('  메시지:', notification.message);
            console.log('  대상 ID:', notification.targetId);
            console.log('  생성 시간:', notification.createdAt);
            console.log('  전체 데이터:', notification);
        });

        console.log('✅ 알림 구독 완료');
        console.log('알림을 기다리는 중... (Ctrl+C로 종료)');
    },
    (error) => {
        console.error('❌ WebSocket 연결 실패:', error);
        process.exit(1);
    }
);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n연결 종료 중...');
    if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
            console.log('연결 종료됨');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});
```

### 2. 의존성 설치 및 실행

```bash
# 의존성 설치 (프로젝트 루트에서)
npm install sockjs-client stompjs

# 스크립트 실행
node test-websocket.js
```

---

## 방법 3: curl을 사용한 REST API 테스트

WebSocket을 직접 테스트할 수 없는 경우, 알림 생성 API를 호출하여 간접적으로 테스트할 수 있습니다.

### 1. 테스트 알림 생성 (Kafka 이벤트 발행)

```bash
# 백엔드 관리자 API를 통해 테스트 알림 생성
# (실제 프로젝트에 admin API가 있다고 가정)

# 또는 프로젝트/결재 등의 이벤트를 발생시켜 알림 생성
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 프로젝트",
    "description": "WebSocket 테스트용"
  }'
```

---

## 테스트 시나리오

### 시나리오 1: 기본 연결 테스트

1. **WebSocket 연결 확인**
   - [ ] SockJS 연결 성공
   - [ ] STOMP handshake 성공
   - [ ] 연결 상태 유지

2. **구독 확인**
   - [ ] `/sub/notification/{userId}` 구독 성공
   - [ ] 에러 없이 대기 상태 유지

### 시나리오 2: 알림 수신 테스트

1. **다른 브라우저/탭에서 이벤트 발생**
   - 프로젝트 생성
   - 태스크 생성
   - 결재 요청 생성

2. **알림 수신 확인**
   - [ ] WebSocket을 통해 실시간 알림 수신
   - [ ] 알림 데이터 포맷 정상 (type, message, targetId 등)
   - [ ] 딜레이 1초 이내

### 시나리오 3: 재연결 테스트

1. **네트워크 장애 시뮬레이션**
   ```javascript
   // 강제 연결 해제
   stompClient.disconnect();

   // 3초 후 재연결
   setTimeout(() => {
       socket = new SockJS('http://localhost:8080/ws');
       stompClient = Stomp.over(socket);
       stompClient.connect({}, ...);
   }, 3000);
   ```

2. **재연결 확인**
   - [ ] 자동 재연결 성공
   - [ ] 구독 상태 복원
   - [ ] 알림 정상 수신

---

## 예상 알림 데이터 포맷

```json
{
  "type": "TASK",
  "message": "새로운 업무가 할당되었습니다: 로그인 기능 구현",
  "targetId": 123,
  "createdAt": "2026-02-16T23:15:00"
}
```

또는

```json
{
  "type": "APPROVAL",
  "message": "결재 요청이 승인되었습니다",
  "targetId": 456,
  "createdAt": "2026-02-16T23:16:30"
}
```

---

## 트러블슈팅

### 문제 1: 연결 실패 (Connection refused)

**원인**: Spring Boot 백엔드가 실행되지 않음

**해결**:
```bash
# 백엔드 실행 확인
curl http://localhost:8080/actuator/health

# 실행되지 않았다면 IntelliJ에서 Spring Boot 시작
```

### 문제 2: CORS 에러

**원인**: WebSocket CORS 설정 누락

**해결**: `WebSocketConfig.java` 확인
```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("*")
        .withSockJS();
}
```

### 문제 3: 알림이 수신되지 않음

**원인**: 잘못된 구독 경로 또는 userId

**해결**:
1. 사용자 ID 확인 (JWT 토큰 디코딩)
2. 구독 경로 확인: `/sub/notification/{userId}`
3. 백엔드 로그 확인 (알림 발송 여부)

### 문제 4: "Handshake failed" 에러

**원인**: SockJS 버전 불일치 또는 설정 오류

**해결**:
```javascript
// SockJS transports 옵션 추가
const socket = new SockJS('http://localhost:8080/ws', null, {
    transports: ['websocket', 'xhr-streaming', 'xhr-polling']
});
```

---

## 백엔드 로그 확인

### Spring Boot 콘솔에서 확인할 로그

```
# WebSocket 연결 로그
2026-02-16 23:15:00.123  INFO --- WebSocket connection established

# STOMP 구독 로그
2026-02-16 23:15:00.456  INFO --- STOMP SUBSCRIBE /sub/notification/2

# 알림 발송 로그
2026-02-16 23:15:30.789  INFO --- 알림 발송 [To: User 2] : 새로운 업무가 할당되었습니다
```

---

## 테스트 체크리스트

### 필수 테스트
- [ ] WebSocket 연결 성공
- [ ] STOMP 구독 성공
- [ ] 알림 수신 확인
- [ ] 연결 종료 정상 처리

### 선택적 테스트
- [ ] 재연결 로직 (자동/수동)
- [ ] 여러 사용자 동시 연결
- [ ] 대량 알림 발송 테스트 (성능)
- [ ] 네트워크 장애 시나리오

---

## 참고 자료

- Spring WebSocket 문서: https://docs.spring.io/spring-framework/reference/web/websocket.html
- STOMP 프로토콜 스펙: https://stomp.github.io/
- SockJS 클라이언트: https://github.com/sockjs/sockjs-client

---

**작성일**: 2026-02-16
**Phase**: 4-2 통합 테스트
**상태**: WebSocket 테스트 가이드 작성 완료
