package com.bizsync.backend.domain.notification.consumer;

import com.bizsync.backend.domain.notification.entity.Notification;
import com.bizsync.backend.domain.notification.repository.NotificationRepository;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.global.config.KafkaTopicConfig;
import com.bizsync.backend.global.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 알림 이벤트 Consumer
 * Kafka에서 알림 이벤트를 수신하여 DB에 저장
 *
 * @author BizSync Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 알림 이벤트 수신 및 처리
     *
     * @param event          알림 이벤트
     * @param acknowledgment Kafka 수동 ACK
     */
    @KafkaListener(
            topics = KafkaTopicConfig.NOTIFICATION_TOPIC,
            groupId = "bizsync-notification-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void consumeNotificationEvent(NotificationEvent event, Acknowledgment acknowledgment) {
        try {
            log.info("알림 이벤트 수신: eventId={}, recipientId={}, title={}",
                    event.getEventId(), event.getRecipientId(), event.getTitle());

            // 수신자 확인
            User recipient = userRepository.findById(event.getRecipientId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "수신자를 찾을 수 없습니다: " + event.getRecipientId()));

            // 발신자 확인 (옵션)
            User sender = null;
            if (event.getUserId() != null) {
                sender = userRepository.findById(event.getUserId()).orElse(null);
            }

            // 알림 생성 및 저장
            Notification notification = Notification.builder()
                    .recipient(recipient)
                    .sender(sender)
                    .title(event.getTitle())
                    .message(event.getMessage())
                    .entityType(event.getEntityType())
                    .entityId(event.getEntityId())
                    .url(event.getUrl())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);

            log.info("알림 저장 완료: notificationId={}, recipientId={}",
                    notification.getNotificationId(), event.getRecipientId());

            // Kafka ACK
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("알림 이벤트 처리 중 오류 발생: eventId={}, error={}",
                    event.getEventId(), e.getMessage(), e);
            // 재처리를 위해 ACK하지 않음 (DLQ로 이동하거나 재시도)
            throw e;
        }
    }
}
