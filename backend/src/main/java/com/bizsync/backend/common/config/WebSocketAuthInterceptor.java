package com.bizsync.backend.common.config;

import com.bizsync.backend.common.exception.UnauthenticatedException;
import com.bizsync.backend.common.util.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

/**
 * WebSocket STOMP 메시지 인증 인터셉터
 *
 * <p>WebSocket 연결 및 메시지 전송 시 JWT 토큰을 검증하고,
 * SecurityContext에 인증 정보를 설정합니다.
 *
 * @author BizSync Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        // CONNECT 명령: 토큰 검증 후 세션에 저장
        if (StompCommand.CONNECT.equals(command)) {
            // 디버깅: 받은 헤더 전체 로그
            log.debug("WebSocket CONNECT attempt. All headers: {}", accessor.toMap());
            log.debug("Native headers: {}", accessor.toNativeHeaderMap());
            
            String token = extractToken(accessor);

            if (!StringUtils.hasText(token)) {
                log.warn("WebSocket connection rejected: No token provided. Headers: {}", accessor.toNativeHeaderMap());
                throw new UnauthenticatedException("인증 토큰이 필요합니다.");
            }
            
            log.debug("Token extracted successfully (length: {})", token.length());

            if (!jwtProvider.validateToken(token)) {
                log.warn("WebSocket connection rejected: Invalid token");
                throw new UnauthenticatedException("유효하지 않은 토큰입니다.");
            }

            // JWT에서 사용자 ID 추출
            Long userId = jwtProvider.getUserId(token);
            if (userId == null) {
                log.warn("WebSocket connection rejected: Cannot extract user ID from token");
                throw new UnauthenticatedException("토큰에서 사용자 정보를 추출할 수 없습니다.");
            }

            // SecurityContext에 인증 정보 설정
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userId.toString(),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            accessor.setUser(authentication);
            
            // 세션 속성에 인증 정보 저장 (세션별 인증 상태 관리)
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("userId", userId);
                sessionAttributes.put("authenticated", true);
                log.debug("WebSocket connection authenticated for user: {} (stored in session)", userId);
            } else {
                log.warn("Session attributes not available, authentication may not persist");
            }
        }
        // SEND/SUBSCRIBE 명령: 세션에서 인증 상태 확인
        else if (StompCommand.SEND.equals(command) || StompCommand.SUBSCRIBE.equals(command)) {
            // 먼저 SecurityContext 확인
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAuthenticated = auth != null && auth.isAuthenticated();
            
            // SecurityContext에 없으면 세션 속성 확인
            if (!isAuthenticated) {
                Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                if (sessionAttributes != null) {
                    Boolean authenticated = (Boolean) sessionAttributes.get("authenticated");
                    Long userId = (Long) sessionAttributes.get("userId");
                    
                    if (authenticated != null && authenticated && userId != null) {
                        // 세션에서 인증 정보를 찾았으면 SecurityContext 복원
                        Authentication sessionAuth = new UsernamePasswordAuthenticationToken(
                                userId.toString(),
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                        SecurityContextHolder.getContext().setAuthentication(sessionAuth);
                        accessor.setUser(sessionAuth);
                        log.debug("Authentication restored from session for user: {}", userId);
                        isAuthenticated = true;
                    }
                }
            }
            
            if (!isAuthenticated) {
                log.warn("WebSocket {} rejected: Not authenticated. Session attributes: {}", 
                        command, accessor.getSessionAttributes());
                throw new MessagingException("인증이 필요합니다.");
            }
        }

        return message;
    }

    /**
     * STOMP 헤더에서 JWT 토큰 추출
     *
     * @param accessor StompHeaderAccessor
     * @return JWT 토큰 또는 null
     */
    private String extractToken(StompHeaderAccessor accessor) {
        // STOMP 헤더는 대소문자를 구분하지 않을 수 있으므로 여러 변형 시도
        // 1. Authorization 헤더 (대문자)
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders == null || authHeaders.isEmpty()) {
            // 2. authorization 헤더 (소문자)
            authHeaders = accessor.getNativeHeader("authorization");
        }
        
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String bearerToken = authHeaders.get(0);
            if (StringUtils.hasText(bearerToken)) {
                // Bearer 접두사 제거 (대소문자 구분 없이)
                String token = bearerToken.trim();
                if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
                    return token.substring(7).trim();
                }
                // Bearer 접두사 없이 토큰만 있는 경우
                return token;
            }
        }

        // 3. token 헤더에서도 시도 (대소문자 모두)
        List<String> tokenHeaders = accessor.getNativeHeader("token");
        if (tokenHeaders == null || tokenHeaders.isEmpty()) {
            tokenHeaders = accessor.getNativeHeader("Token");
        }
        if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
            return tokenHeaders.get(0).trim();
        }

        return null;
    }
}
