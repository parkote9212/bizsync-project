package com.bizsync.backend.global.config;

import com.bizsync.backend.global.common.exception.UnauthenticatedException;
import com.bizsync.backend.global.security.jwt.JwtProvider;
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

        if (StompCommand.CONNECT.equals(command)) {
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

            Long userId = jwtProvider.getUserId(token);
            if (userId == null) {
                log.warn("WebSocket connection rejected: Cannot extract user ID from token");
                throw new UnauthenticatedException("토큰에서 사용자 정보를 추출할 수 없습니다.");
            }

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userId.toString(),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            accessor.setUser(authentication);

            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("userId", userId);
                sessionAttributes.put("authenticated", true);
                log.debug("WebSocket connection authenticated for user: {} (stored in session)", userId);
            } else {
                log.warn("Session attributes not available, authentication may not persist");
            }
        } else if (StompCommand.SEND.equals(command) || StompCommand.SUBSCRIBE.equals(command)) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAuthenticated = auth != null && auth.isAuthenticated();

            if (!isAuthenticated) {
                Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                if (sessionAttributes != null) {
                    Boolean authenticated = (Boolean) sessionAttributes.get("authenticated");
                    Long userId = (Long) sessionAttributes.get("userId");

                    if (authenticated != null && authenticated && userId != null) {
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

    private String extractToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders == null || authHeaders.isEmpty()) {
            authHeaders = accessor.getNativeHeader("authorization");
        }

        if (authHeaders != null && !authHeaders.isEmpty()) {
            String bearerToken = authHeaders.get(0);
            if (StringUtils.hasText(bearerToken)) {
                String token = bearerToken.trim();
                if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
                    return token.substring(7).trim();
                }
                return token;
            }
        }

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
