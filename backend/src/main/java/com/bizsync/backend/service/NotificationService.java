package com.bizsync.backend.service;

import com.bizsync.backend.dto.response.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 특정 유저에게 알림 발송
     * @param userId 수신자 ID
     * @param message 알림 내용
     * @param targetId 관련 문서/업무 ID
     */
    public void sendToUser(Long userId, String message, Long targetId) {
        // 알림 객체 생성
        NotificationDTO notification = new NotificationDTO("APPROVAL", message, targetId);

        // 개인 채널로 발송 (/sub/notification/1)
        String destination = "/sub/notification/" + userId;

        messagingTemplate.convertAndSend(destination, notification);

        log.info("알림 발송 [To: User {}] : {}", userId, message);
    }
}