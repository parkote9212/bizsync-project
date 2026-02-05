package com.bizsync.backend.domain.notification;

/**
 * Notification Sealed Interface
 * 
 * <p>Java 21의 Sealed Interface를 사용하여 알림 타입을 제한합니다.
 * 이를 통해 컴파일 타임에 모든 가능한 알림 타입을 검증할 수 있습니다.
 * 
 * <p>허용된 구현체:
 * <ul>
 *   <li>{@link ApprovalNotification} - 결재 관련 알림</li>
 *   <li>{@link ProjectNotification} - 프로젝트 관련 알림</li>
 *   <li>{@link CommentNotification} - 댓글 관련 알림</li>
 * </ul>
 * 
 * <p>Pattern Matching과 함께 사용하여 타입 안전성을 보장합니다.
 * 
 * @author BizSync Team
 */
public sealed interface Notification 
    permits ApprovalNotification, ProjectNotification, CommentNotification {
    
    /**
     * 알림과 연관된 대상 ID (문서 ID, 프로젝트 ID, 댓글 ID 등)
     * 
     * @return 대상 ID
     */
    Long targetId();
    
    /**
     * 알림 타입 (APPROVAL, PROJECT, COMMENT 등)
     * 
     * @return 알림 타입 문자열
     */
    String type();
}
