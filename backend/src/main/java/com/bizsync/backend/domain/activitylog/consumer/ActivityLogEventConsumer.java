package com.bizsync.backend.domain.activitylog.consumer;

import com.bizsync.backend.domain.activitylog.entity.ActivityLog;
import com.bizsync.backend.domain.activitylog.repository.ActivityLogRepository;
import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.project.repository.ProjectRepository;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.global.config.KafkaTopicConfig;
import com.bizsync.backend.global.event.ActivityLogEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 활동 로그 이벤트 Consumer
 * Kafka에서 활동 로그 이벤트를 수신하여 DB에 저장
 *
 * @author BizSync Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ActivityLogEventConsumer {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final org.springframework.kafka.core.KafkaTemplate<String, com.bizsync.backend.global.event.EventMessage> kafkaTemplate;

    /**
     * 활동 로그 이벤트 수신 및 처리
     *
     * @param event          활동 로그 이벤트
     * @param acknowledgment Kafka 수동 ACK
     */
    @KafkaListener(
            topics = KafkaTopicConfig.ACTIVITY_LOG_TOPIC,
            groupId = "bizsync-activity-log-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void consumeActivityLogEvent(ActivityLogEvent event, Acknowledgment acknowledgment) {
        try {
            log.info("활동 로그 이벤트 수신: eventId={}, userId={}, action={}",
                    event.getEventId(), event.getUserId(), event.getAction());

            // 사용자 확인
            User user = userRepository.findById(event.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "사용자를 찾을 수 없습니다: " + event.getUserId()));

            // 프로젝트 확인 (옵션)
            Project project = null;
            if (event.getProjectId() != null) {
                project = projectRepository.findById(event.getProjectId()).orElse(null);
            }

            // 활동 로그 생성 및 저장
            ActivityLog activityLog = ActivityLog.builder()
                    .user(user)
                    .project(project)
                    .action(event.getAction())
                    .entityType(event.getEntityType())
                    .entityId(event.getEntityId())
                    .entityName(event.getEntityName())
                    .beforeValue(event.getBeforeValue())
                    .afterValue(event.getAfterValue())
                    .ipAddress(event.getIpAddress())
                    .userAgent(event.getUserAgent())
                    .build();

            activityLogRepository.save(activityLog);

            log.info("활동 로그 저장 완료: logId={}, userId={}, action={}",
                    activityLog.getLogId(), event.getUserId(), event.getAction());

            // Kafka ACK
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("활동 로그 이벤트 처리 중 오류 발생: eventId={}, error={}",
                    event.getEventId(), e.getMessage(), e);

            // DLQ로 전송
            sendToDlq(event, e);

            // ACK하여 재시도 방지
            acknowledgment.acknowledge();
        }
    }

    /**
     * 처리 실패한 이벤트를 DLQ로 전송
     */
    private void sendToDlq(ActivityLogEvent event, Exception exception) {
        try {
            log.warn("활동 로그 이벤트를 DLQ로 전송: eventId={}, error={}",
                    event.getEventId(), exception.getMessage());

            kafkaTemplate.send(
                    KafkaTopicConfig.ACTIVITY_LOG_DLQ_TOPIC,
                    event.getEventId(),
                    event
            );
        } catch (Exception dlqException) {
            log.error("DLQ 전송 실패: eventId={}, error={}",
                    event.getEventId(), dlqException.getMessage(), dlqException);
        }
    }
}
