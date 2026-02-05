package com.bizsync.backend.domain.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 채팅 접속 상태 관리 서비스
 *
 * <p>프로젝트별 온라인 사용자 목록을 관리하고,
 * 접속/해제 시 다른 사용자에게 브로드캐스트합니다.
 *
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PresenceService {

    private final SimpMessagingTemplate messagingTemplate;

    // 프로젝트별 온라인 사용자 목록 관리 (roomId -> Set<userId>)
    private final Map<Long, Set<Long>> onlineUsersByRoom = new ConcurrentHashMap<>();

    /**
     * 사용자가 특정 채팅방에 접속했음을 등록
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @param userId 사용자 ID
     */
    public void userConnected(Long roomId, Long userId) {
        onlineUsersByRoom.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(userId);
        broadcastPresence(roomId);
        log.debug("User {} connected to room {}", userId, roomId);
    }

    /**
     * 사용자가 특정 채팅방에서 해제되었음을 등록
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @param userId 사용자 ID
     */
    public void userDisconnected(Long roomId, Long userId) {
        Set<Long> users = onlineUsersByRoom.get(roomId);
        if (users != null) {
            users.remove(userId);
            if (users.isEmpty()) {
                onlineUsersByRoom.remove(roomId);
            } else {
                broadcastPresence(roomId);
            }
        }
        log.debug("User {} disconnected from room {}", userId, roomId);
    }

    /**
     * 특정 채팅방의 온라인 사용자 목록 조회
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @return 온라인 사용자 ID 목록
     */
    public Set<Long> getOnlineUsers(Long roomId) {
        return new HashSet<>(onlineUsersByRoom.getOrDefault(roomId, Collections.emptySet()));
    }

    /**
     * 특정 채팅방의 접속 상태를 모든 구독자에게 브로드캐스트
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     */
    private void broadcastPresence(Long roomId) {
        Set<Long> onlineUsers = getOnlineUsers(roomId);
        messagingTemplate.convertAndSend("/topic/presence/" + roomId, onlineUsers);
    }

    /**
     * 모든 채팅방에서 특정 사용자 제거 (로그아웃 등)
     *
     * @param userId 사용자 ID
     */
    public void removeUserFromAllRooms(Long userId) {
        onlineUsersByRoom.forEach((roomId, users) -> {
            if (users.remove(userId)) {
                if (users.isEmpty()) {
                    onlineUsersByRoom.remove(roomId);
                } else {
                    broadcastPresence(roomId);
                }
            }
        });
        log.debug("User {} removed from all rooms", userId);
    }
}
