package com.bizsync.backend.global.config;

import com.bizsync.backend.domain.project.service.PresenceService;
import com.bizsync.backend.global.common.util.SecurityUtil;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final PresenceService presenceService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.debug("WebSocket session connected: {}", event.getMessage());
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Optional<Long> userIdOpt = SecurityUtil.getCurrentUserId();

        if (userIdOpt.isPresent()) {
            Long userId = userIdOpt.get();
            presenceService.removeUserFromAllRooms(userId);
            log.debug("User {} disconnected from all chat rooms", userId);
        }
    }

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

        if (destination.startsWith("/topic/chat/room/")) {
            String roomIdStr = destination.substring("/topic/chat/room/".length());
            try {
                Long roomId = Long.parseLong(roomIdStr);
                presenceService.userConnected(roomId, userId);
                log.debug("User {} subscribed to chat room {}", userId, roomId);
            } catch (NumberFormatException e) {
                log.warn("Invalid room ID in destination: {}", destination);
            }
        } else if (destination.startsWith("/topic/presence/")) {
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

        if (destination.startsWith("/topic/chat/room/")) {
            String roomIdStr = destination.substring("/topic/chat/room/".length());
            try {
                Long roomId = Long.parseLong(roomIdStr);
                presenceService.userDisconnected(roomId, userId);
                log.debug("User {} unsubscribed from chat room {}", userId, roomId);
            } catch (NumberFormatException e) {
                log.warn("Invalid room ID in destination: {}", destination);
            }
        } else if (destination.startsWith("/topic/presence/")) {
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
