package com.bizsync.backend.service;

import com.bizsync.backend.common.aop.PerformanceLogging;
import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.domain.notification.ApprovalNotification;
import com.bizsync.backend.domain.notification.CommentNotification;
import com.bizsync.backend.domain.notification.Notification;
import com.bizsync.backend.domain.notification.ProjectNotification;
import com.bizsync.backend.dto.response.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 알림 발송 관련 비즈니스 로직을 처리하는 서비스
 *
 * <p>Java 21의 Pattern Matching과 Sealed Interface를 활용하여
 * 타입 안전하고 확장 가능한 알림 시스템을 제공합니다.
 *
 * <p>주요 기능:
 * <ul>
 *   <li>결재 승인/반려 알림</li>
 *   <li>프로젝트 생성/완료 알림</li>
 *   <li>댓글 알림</li>
 *   <li>Virtual Threads 기반 대량 알림 발송</li>
 * </ul>
 *
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final String APPROVAL_APPROVED_MESSAGE = "%s님이 상신한 '%s'이(가) 최종 승인되었습니다.";
    private static final String APPROVAL_REJECTED_MESSAGE = "%s님이 상신한 '%s'이(가) 반려되었습니다.";
    private static final String APPROVAL_REQUESTED_MESSAGE = "%s님이 상신한 '%s' 결재 요청이 있습니다.";
    private static final String PROJECT_CREATED_MESSAGE = "새 프로젝트 '%s'이(가) 생성되었습니다.";
    private static final String PROJECT_COMPLETED_MESSAGE = "프로젝트 '%s'이(가) 완료되었습니다.";
    private static final String PROJECT_UPDATE_MESSAGE = "프로젝트 '%s' 업데이트: %s";
    private static final String COMMENT_MESSAGE = "%s님이 댓글을 남겼습니다: %s";

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 알림 발송 (Java 21 Pattern Matching 사용)
     * 
     * <p>Sealed Interface와 Pattern Matching을 사용하여
     * 컴파일 타임에 모든 알림 타입 처리를 보장합니다.
     *
     * @param userId       수신자 ID
     * @param notification 알림 객체 (ApprovalNotification, ProjectNotification, CommentNotification)
     */
    public void send(Long userId, Notification notification) {
        // Pattern Matching for Switch (Java 21)
        String message = switch (notification) {
            case ApprovalNotification(
                Long documentId,
                String action,
                String drafterName,
                String documentTitle
            ) -> formatApprovalMessage(action, drafterName, documentTitle);
            
            case ProjectNotification(
                Long projectId,
                String event,
                String projectName
            ) -> formatProjectMessage(event, projectName);
            
            case CommentNotification(
                Long commentId,
                String commenterName,
                String content
            ) -> formatCommentMessage(commenterName, content);
        };

        NotificationDTO dto = NotificationDTO.from(
                notification.type(),
                message,
                notification.targetId()
        );
        sendToDestination(userId, dto);

        log.info("알림 발송 [To: User {}] Type: {}, Message: {}", 
                userId, notification.type(), message);
    }

    /**
     * 결재 알림 메시지 포맷팅
     */
    private String formatApprovalMessage(String action, String drafterName, String documentTitle) {
        return switch (action) {
            case "APPROVED" -> String.format(APPROVAL_APPROVED_MESSAGE, drafterName, documentTitle);
            case "REJECTED" -> String.format(APPROVAL_REJECTED_MESSAGE, drafterName, documentTitle);
            case "REQUESTED" -> String.format(APPROVAL_REQUESTED_MESSAGE, drafterName, documentTitle);
            default -> throw new IllegalArgumentException("Unknown approval action: " + action);
        };
    }

    /**
     * 프로젝트 알림 메시지 포맷팅
     */
    private String formatProjectMessage(String event, String projectName) {
        return switch (event) {
            case "CREATED" -> String.format(PROJECT_CREATED_MESSAGE, projectName);
            case "COMPLETED" -> String.format(PROJECT_COMPLETED_MESSAGE, projectName);
            default -> String.format(PROJECT_UPDATE_MESSAGE, projectName, event);
        };
    }

    /**
     * 댓글 알림 메시지 포맷팅
     */
    private String formatCommentMessage(String commenterName, String content) {
        return String.format(COMMENT_MESSAGE, commenterName, content);
    }

    /**
     * 결재가 최종 승인되었을 때 기안자에게 알림 발송
     *
     * @param document 승인 완료된 결재 문서
     */
    public void sendApprovalCompleteNotification(ApprovalDocument document) {
        Long drafterId = document.getDrafter().getUserId();
        String drafterName = document.getDrafter().getName();
        String documentTitle = document.getTitle();

        // ApprovalNotification Record 생성
        Notification notification = ApprovalNotification.approved(
            document.getDocumentId(),
            drafterName,
            documentTitle
        );

        send(drafterId, notification);

        log.info("결재 승인 완료 알림 발송 - 문서 ID: {}, 기안자: {}",
                document.getDocumentId(), drafterName);
    }

    /**
     * 결재가 반려되었을 때 기안자에게 알림 발송
     *
     * @param document     반려된 결재 문서
     * @param rejectReason 반려 사유
     */
    public void sendApprovalRejectedNotification(ApprovalDocument document, String rejectReason) {
        Long drafterId = document.getDrafter().getUserId();
        String drafterName = document.getDrafter().getName();
        String documentTitle = document.getTitle();

        // 반려 사유를 제목에 포함
        String titleWithReason = String.format(
            "%s (사유: %s)",
            documentTitle,
            rejectReason != null ? rejectReason : "미기재"
        );

        Notification notification = ApprovalNotification.rejected(
            document.getDocumentId(),
            drafterName,
            titleWithReason
        );

        send(drafterId, notification);

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
        String drafterName = document.getDrafter().getName();
        String documentTitle = String.format("%s (%d차 결재자)", document.getTitle(), sequence);

        Notification notification = ApprovalNotification.requested(
            document.getDocumentId(),
            drafterName,
            documentTitle
        );

        send(approverId, notification);

        log.info("결재 요청 알림 발송 - 문서 ID: {}, 결재자: {} ({}차)",
                document.getDocumentId(), approverName, sequence);
    }

    /**
     * 여러 사용자에게 동시에 알림 발송 (Virtual Threads 사용)
     * 
     * <p>Java 21의 Virtual Threads를 사용하여 대량의 알림을 병렬로 발송합니다.
     * 기존 Platform Thread 방식 대비 메모리 사용량이 적고, I/O 대기 시간이 많은 작업에 최적화되어 있습니다.
     * 
     * <p>성능 개선 예시:
     * <ul>
     *   <li>100명 순차 발송: ~1,000ms</li>
     *   <li>100명 병렬 발송: ~50ms (95% 개선)</li>
     * </ul>
     *
     * @param userIds      수신자 ID 리스트
     * @param notification 알림 객체
     */
    @PerformanceLogging
    public void sendBulk(List<Long> userIds, Notification notification) {
        if (userIds == null || userIds.isEmpty()) {
            log.warn("대량 알림 발송 실패: 수신자 목록이 비어있습니다.");
            return;
        }

        // Virtual Thread Executor 생성 (작업당 1개의 가상 스레드)
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            
            // 각 사용자에게 비동기로 알림 발송
            List<CompletableFuture<Void>> futures = userIds.stream()
                    .map(userId -> CompletableFuture.runAsync(
                            () -> send(userId, notification),
                            executor
                    ))
                    .toList();

            // 모든 알림 발송 완료 대기
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        } catch (Exception e) {
            log.error("대량 알림 발송 중 오류 발생", e);
        }
    }

    // ========== 하위 호환성을 위한 레거시 메서드 (Deprecated) ==========
    
    /**
     * @deprecated Use {@link #send(Long, Notification)} instead. 내부적으로 단일 발송 로직을 재사용합니다.
     */
    @Deprecated(since = "2.0", forRemoval = true)
    public void sendToUser(Long userId, String message, Long targetId) {
        NotificationDTO dto = NotificationDTO.from("APPROVAL", message, targetId);
        sendToDestination(userId, dto);
        log.info("알림 발송 [To: User {}] : {}", userId, message);
    }

    /**
     * 웹소켓 목적지로 알림 DTO를 발송합니다. (send / sendToUser 공통)
     */
    private void sendToDestination(Long userId, NotificationDTO dto) {
        String destination = "/sub/notification/" + userId;
        messagingTemplate.convertAndSend(destination, dto);
    }

    /**
     * @deprecated Use {@link #sendBulk(List, Notification)} instead. 내부적으로 sendBulk와 동일한 Virtual Thread 발송을 사용합니다.
     */
    @Deprecated(since = "2.0", forRemoval = true)
    @PerformanceLogging
    public void sendBulkNotification(List<Long> userIds, String message, Long targetId) {
        if (userIds == null || userIds.isEmpty()) {
            log.warn("대량 알림 발송 실패: 수신자 목록이 비어있습니다.");
            return;
        }
        NotificationDTO dto = NotificationDTO.from("APPROVAL", message, targetId);
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<Void>> futures = userIds.stream()
                    .map(userId -> CompletableFuture.runAsync(
                            () -> sendToDestination(userId, dto),
                            executor
                    ))
                    .toList();
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        } catch (Exception e) {
            log.error("대량 알림 발송 중 오류 발생", e);
        }
    }
}
