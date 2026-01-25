package com.bizsync.backend.service;

import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.dto.response.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * 알림 발송 관련 비즈니스 로직을 처리하는 서비스
 * 
 * <p>결재 승인/반려 알림, 결재 요청 알림 등의 WebSocket 기반 실시간 알림을 제공합니다.
 * 
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 특정 유저에게 알림 발송
     *
     * @param userId   수신자 ID
     * @param message  알림 내용
     * @param targetId 관련 문서/업무 ID
     */
    public void sendToUser(Long userId, String message, Long targetId) {
        // 알림 객체 생성
        NotificationDTO notification = NotificationDTO.from("APPROVAL", message, targetId);

        // 개인 채널로 발송 (/sub/notification/1)
        String destination = "/sub/notification/" + userId;

        messagingTemplate.convertAndSend(destination, notification);

        log.info("알림 발송 [To: User {}] : {}", userId, message);
    }

    /**
     * 결재가 최종 승인되었을 때 기안자에게 알림 발송
     *
     * @param document 승인 완료된 결재 문서
     *                 <p>
     *                 발송 대상: 기안자(drafter)
     *                 메시지 예시: "김철수님이 상신한 '출장비 지출 건'이 최종 승인되었습니다."
     */
    public void sendApprovalCompleteNotification(ApprovalDocument document) {
        Long drafterId = document.getDrafter().getUserId();
        String drafterName = document.getDrafter().getName();

        String message = String.format(
                "%s님이 상신한 '%s'이(가) 최종 승인되었습니다.",
                drafterName,
                document.getTitle()
        );

        sendToUser(drafterId, message, document.getDocumentId());

        log.info("결재 승인 완료 알림 발송 - 문서 ID: {}, 기안자: {}",
                document.getDocumentId(), drafterName);
    }

    /**
     * 결재가 반려되었을 때 기안자에게 알림 발송
     *
     * @param document     반려된 결재 문서
     * @param rejectReason 반려 사유
     *                     <p>
     *                     발송 대상: 기안자(drafter)
     *                     메시지 예시: "김철수님이 상신한 '출장비 지출 건'이 반려되었습니다. (사유: 증빙 서류 부족)"
     */
    public void sendApprovalRejectedNotification(ApprovalDocument document, String rejectReason) {
        Long drafterId = document.getDrafter().getUserId();
        String drafterName = document.getDrafter().getName();

        String message = String.format(
                "%s님이 상신한 '%s'이(가) 반려되었습니다. (사유: %s)",
                drafterName,
                document.getTitle(),
                rejectReason != null ? rejectReason : "미기재"
        );

        sendToUser(drafterId, message, document.getDocumentId());

        log.info("결재 반려 알림 발송 - 문서 ID: {}, 기안자: {}, 사유: {}",
                document.getDocumentId(), drafterName, rejectReason);
    }

    /**
     * 새로운 결재 문서가 상신되었을 때 결재자에게 알림 발송
     *
     * @param document     상신된 결재 문서
     * @param approverId   결재자 ID
     * @param approverName 결재자 이름
     * @param sequence     결재 순서
     */
    public void sendApprovalRequestNotification(
            ApprovalDocument document,
            Long approverId,
            String approverName,
            Integer sequence
    ) {
        String message = String.format(
                "%s님이 상신한 '%s' 결재 요청이 있습니다. (%d차 결재자)",
                document.getDrafter().getName(),
                document.getTitle(),
                sequence
        );

        sendToUser(approverId, message, document.getDocumentId());

        log.info("결재 요청 알림 발송 - 문서 ID: {}, 결재자: {} ({}차)",
                document.getDocumentId(), approverName, sequence);
    }

}