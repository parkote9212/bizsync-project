package com.bizsync.backend.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket STOMP 설정
 *
 * <p>WebSocket 엔드포인트, 메시지 브로커, 인증 인터셉터를 설정합니다.
 *
 * @author BizSync Team
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 순수 WebSocket (ws://) — 알림, 채팅, 칸반. brokerURL로 직접 연결.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
        registry.addEndpoint("/ws-kanban")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Subscribe
        registry.enableSimpleBroker("/sub", "/topic");

        // Publish
        registry.setApplicationDestinationPrefixes("/pub", "/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // WebSocket 인증 인터셉터 등록
        registration.interceptors(webSocketAuthInterceptor);
    }
}
