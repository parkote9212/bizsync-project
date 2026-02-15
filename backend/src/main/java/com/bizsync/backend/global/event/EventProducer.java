package com.bizsync.backend.global.event;

import com.bizsync.backend.global.config.KafkaTopicConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * 이벤트 Producer
 * Kafka로 이벤트를 발행하는 서비스
 *
 * @author BizSync Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventProducer {

    private final KafkaTemplate<String, EventMessage> kafkaTemplate;

    /**
     * 알림 이벤트 발행
     *
     * @param event 알림 이벤트
     */
    public void publishNotificationEvent(NotificationEvent event) {
        publishEvent(KafkaTopicConfig.NOTIFICATION_TOPIC, event);
    }

    /**
     * 활동 로그 이벤트 발행
     *
     * @param event 활동 로그 이벤트
     */
    public void publishActivityLogEvent(ActivityLogEvent event) {
        publishEvent(KafkaTopicConfig.ACTIVITY_LOG_TOPIC, event);
    }

    /**
     * 결재 이벤트 발행
     *
     * @param event 결재 이벤트
     */
    public void publishApprovalEvent(ApprovalEvent event) {
        publishEvent(KafkaTopicConfig.APPROVAL_TOPIC, event);
    }

    /**
     * 이벤트 발행 (공통)
     *
     * @param topic 토픽명
     * @param event 이벤트
     */
    private void publishEvent(String topic, EventMessage event) {
        try {
            // 이벤트 ID를 파티션 키로 사용 (같은 이벤트는 같은 파티션으로)
            String key = event.getEventId();

            CompletableFuture<SendResult<String, EventMessage>> future =
                    kafkaTemplate.send(topic, key, event);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("이벤트 발행 성공: topic={}, eventType={}, eventId={}",
                            topic, event.getEventType(), event.getEventId());
                } else {
                    log.error("이벤트 발행 실패: topic={}, eventType={}, eventId={}, error={}",
                            topic, event.getEventType(), event.getEventId(), ex.getMessage(), ex);
                }
            });

        } catch (Exception e) {
            log.error("이벤트 발행 중 예외 발생: topic={}, eventType={}, error={}",
                    topic, event.getEventType(), e.getMessage(), e);
        }
    }
}
