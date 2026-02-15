package com.bizsync.backend.domain.approval.consumer;

import com.bizsync.backend.domain.notification.entity.Notification;
import com.bizsync.backend.domain.notification.repository.NotificationRepository;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.global.config.KafkaTopicConfig;
import com.bizsync.backend.global.event.ApprovalEvent;
import com.bizsync.backend.global.event.EventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 결재 이벤트 Consumer
 * Kafka에서 결재 이벤트를 수신하여 알림 생성
 *
 * @author BizSync Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApprovalEventConsumer {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 결재 이벤트 수신 및 처리
     * 결재 관련 이벤트 발생 시 관련 사용자들에게 알림 전송
     *
     * @param event          결재 이벤트
     * @param acknowledgment Kafka 수동 ACK
     */
    @KafkaListener(
            topics = KafkaTopicConfig.APPROVAL_TOPIC,
            groupId = "bizsync-approval-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void consumeApprovalEvent(ApprovalEvent event, Acknowledgment acknowledgment) {
        try {
            log.info("결재 이벤트 수신: eventId={}, eventType={}, approvalId={}",
                    event.getEventId(), event.getEventType(), event.getApprovalId());

            switch (event.getEventType()) {
                case APPROVAL_REQUESTED -> handleApprovalRequested(event);
                case APPROVAL_APPROVED -> handleApprovalApproved(event);
                case APPROVAL_REJECTED -> handleApprovalRejected(event);
                case APPROVAL_CANCELED -> handleApprovalCanceled(event);
                default -> log.warn("알 수 없는 결재 이벤트 타입: {}", event.getEventType());
            }

            // Kafka ACK
            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("결재 이벤트 처리 중 오류 발생: eventId={}, error={}",
                    event.getEventId(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 결재 요청 이벤트 처리
     * 다음 결재자에게 알림 전송
     */
    private void handleApprovalRequested(ApprovalEvent event) {
        if (event.getNextApproverId() == null) {
            log.warn("다음 결재자가 없습니다: approvalId={}", event.getApprovalId());
            return;
        }

        User nextApprover = userRepository.findById(event.getNextApproverId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "다음 결재자를 찾을 수 없습니다: " + event.getNextApproverId()));

        User requester = event.getRequesterId() != null
                ? userRepository.findById(event.getRequesterId()).orElse(null)
                : null;

        Notification notification = Notification.builder()
                .recipient(nextApprover)
                .sender(requester)
                .title("새로운 결재 요청")
                .message(String.format("[%s] 결재 요청이 도착했습니다.", event.getApprovalTitle()))
                .entityType("APPROVAL")
                .entityId(event.getApprovalId())
                .url("/approvals/" + event.getApprovalId())
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("결재 요청 알림 생성: approvalId={}, nextApproverId={}",
                event.getApprovalId(), event.getNextApproverId());
    }

    /**
     * 결재 승인 이벤트 처리
     * 요청자에게 승인 알림 전송, 다음 결재자가 있으면 알림 전송
     */
    private void handleApprovalApproved(ApprovalEvent event) {
        // 요청자에게 승인 알림
        if (event.getRequesterId() != null) {
            User requester = userRepository.findById(event.getRequesterId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "요청자를 찾을 수 없습니다: " + event.getRequesterId()));

            User approver = event.getApproverId() != null
                    ? userRepository.findById(event.getApproverId()).orElse(null)
                    : null;

            Notification notification = Notification.builder()
                    .recipient(requester)
                    .sender(approver)
                    .title("결재 승인")
                    .message(String.format("[%s] %s님이 결재를 승인했습니다.",
                            event.getApprovalTitle(),
                            event.getApproverName() != null ? event.getApproverName() : "결재자"))
                    .entityType("APPROVAL")
                    .entityId(event.getApprovalId())
                    .url("/approvals/" + event.getApprovalId())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
        }

        // 다음 결재자가 있으면 알림
        if (event.getNextApproverId() != null) {
            User nextApprover = userRepository.findById(event.getNextApproverId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "다음 결재자를 찾을 수 없습니다: " + event.getNextApproverId()));

            Notification notification = Notification.builder()
                    .recipient(nextApprover)
                    .sender(null)
                    .title("결재 대기")
                    .message(String.format("[%s] 결재 순서가 되었습니다.", event.getApprovalTitle()))
                    .entityType("APPROVAL")
                    .entityId(event.getApprovalId())
                    .url("/approvals/" + event.getApprovalId())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
        }

        log.info("결재 승인 알림 생성: approvalId={}", event.getApprovalId());
    }

    /**
     * 결재 반려 이벤트 처리
     * 요청자에게 반려 알림 전송
     */
    private void handleApprovalRejected(ApprovalEvent event) {
        if (event.getRequesterId() == null) {
            log.warn("요청자 정보가 없습니다: approvalId={}", event.getApprovalId());
            return;
        }

        User requester = userRepository.findById(event.getRequesterId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "요청자를 찾을 수 없습니다: " + event.getRequesterId()));

        User approver = event.getApproverId() != null
                ? userRepository.findById(event.getApproverId()).orElse(null)
                : null;

        String message = String.format("[%s] %s님이 결재를 반려했습니다.",
                event.getApprovalTitle(),
                event.getApproverName() != null ? event.getApproverName() : "결재자");

        if (event.getComment() != null && !event.getComment().isBlank()) {
            message += " 사유: " + event.getComment();
        }

        Notification notification = Notification.builder()
                .recipient(requester)
                .sender(approver)
                .title("결재 반려")
                .message(message)
                .entityType("APPROVAL")
                .entityId(event.getApprovalId())
                .url("/approvals/" + event.getApprovalId())
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("결재 반려 알림 생성: approvalId={}", event.getApprovalId());
    }

    /**
     * 결재 취소 이벤트 처리
     * 현재 결재자(들)에게 취소 알림 전송
     */
    private void handleApprovalCanceled(ApprovalEvent event) {
        // 실제 구현에서는 현재 대기 중인 결재자 목록을 조회하여 알림 전송
        // 여기서는 로그만 남김
        log.info("결재 취소 이벤트: approvalId={}", event.getApprovalId());
    }
}
