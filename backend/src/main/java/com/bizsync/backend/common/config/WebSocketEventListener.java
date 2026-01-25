package com.bizsync.backend.common.config;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.util.Optional;

/**
 * WebSocket 이벤트 리스너
 *
 * <p>WebSocket 연결/해제, 구독/구독 해제 이벤트를 처리하여
 * 접속 상태를 관리합니다.
 *
 * @author BizSync Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final PresenceService presenceService;

    /**
     * WebSocket 세션 연결 이벤트 처리
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.debug("WebSocket session connected: {}", event.getMessage());
    }

    /**
     * WebSocket 세션 해제 이벤트 처리
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Optional<Long> userIdOpt = SecurityUtil.getCurrentUserId();

        if (userIdOpt.isPresent()) {
            Long userId = userIdOpt.get();
            // 모든 채팅방에서 사용자 제거
            presenceService.removeUserFromAllRooms(userId);
            log.debug("User {} disconnected from all chat rooms", userId);
        }
    }

    /**
     * 채팅방 구독 이벤트 처리
     */
    @EventListener
    public void handleSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();

        if (destination == null) {
            return;
        }

        Optional<Long> userIdOpt = SecurityUtil.getCurrentUserId();
        if (userIdOpt.isEmpty()) {
            return;
        }
        Long userId = userIdOpt.get();

        // 채팅방 메시지 구독: /topic/chat/room/{roomId}
        if (destination.startsWith("/topic/chat/room/")) {
            String roomIdStr = destination.substring("/topic/chat/room/".length());
            try {
                Long roomId = Long.parseLong(roomIdStr);
                presenceService.userConnected(roomId, userId);
                log.debug("User {} subscribed to chat room {}", userId, roomId);
            } catch (NumberFormatException e) {
                log.warn("Invalid room ID in destination: {}", destination);
            }
        }
        // 접속 상태 구독: /topic/presence/{roomId}
        else if (destination.startsWith("/topic/presence/")) {
            String roomIdStr = destination.substring("/topic/presence/".length());
            try {
                Long roomId = Long.parseLong(roomIdStr);
                presenceService.userConnected(roomId, userId);
                log.debug("User {} subscribed to presence for room {}", userId, roomId);
            } catch (NumberFormatException e) {
                log.warn("Invalid room ID in destination: {}", destination);
            }
        }
    }

    /**
     * 채팅방 구독 해제 이벤트 처리
     */
    @EventListener
    public void handleUnsubscribeEvent(SessionUnsubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();

        if (destination == null) {
            return;
        }

        Optional<Long> userIdOpt = SecurityUtil.getCurrentUserId();
        if (userIdOpt.isEmpty()) {
            return;
        }
        Long userId = userIdOpt.get();

        // 채팅방 메시지 구독 해제: /topic/chat/room/{roomId}
        if (destination.startsWith("/topic/chat/room/")) {
            String roomIdStr = destination.substring("/topic/chat/room/".length());
            try {
                Long roomId = Long.parseLong(roomIdStr);
                presenceService.userDisconnected(roomId, userId);
                log.debug("User {} unsubscribed from chat room {}", userId, roomId);
            } catch (NumberFormatException e) {
                log.warn("Invalid room ID in destination: {}", destination);
            }
        }
        // 접속 상태 구독 해제: /topic/presence/{roomId}
        else if (destination.startsWith("/topic/presence/")) {
            String roomIdStr = destination.substring("/topic/presence/".length());
            try {
                Long roomId = Long.parseLong(roomIdStr);
                presenceService.userDisconnected(roomId, userId);
                log.debug("User {} unsubscribed from presence for room {}", userId, roomId);
            } catch (NumberFormatException e) {
                log.warn("Invalid room ID in destination: {}", destination);
            }
        }
    }
}
