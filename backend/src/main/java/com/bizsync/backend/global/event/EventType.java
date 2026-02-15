package com.bizsync.backend.global.event;

/**
 * 이벤트 타입 정의
 *
 * @author BizSync Team
 */
public enum EventType {
    // 알림 이벤트
    NOTIFICATION_CREATED,
    NOTIFICATION_READ,

    // 활동 로그 이벤트
    ACTIVITY_LOG_CREATED,

    // 결재 이벤트
    APPROVAL_REQUESTED,
    APPROVAL_APPROVED,
    APPROVAL_REJECTED,
    APPROVAL_CANCELED,

    // 프로젝트 이벤트
    PROJECT_CREATED,
    PROJECT_UPDATED,
    PROJECT_DELETED,
    PROJECT_MEMBER_ADDED,
    PROJECT_MEMBER_REMOVED,

    // 태스크 이벤트
    TASK_CREATED,
    TASK_UPDATED,
    TASK_DELETED,
    TASK_ASSIGNED,
    TASK_STATUS_CHANGED,

    // 댓글 이벤트
    COMMENT_CREATED,
    COMMENT_UPDATED,
    COMMENT_DELETED
}
