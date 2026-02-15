package com.bizsync.backend.global.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 활동 로그 이벤트
 * 시스템 내 주요 활동을 기록하기 위한 이벤트
 *
 * @author BizSync Team
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ActivityLogEvent extends EventMessage {

    /**
     * 활동 설명 (예: "새 프로젝트를 생성했습니다", "태스크 상태를 변경했습니다")
     */
    private String action;

    /**
     * 활동 대상 엔티티 타입 (예: PROJECT, TASK, APPROVAL)
     */
    private String entityType;

    /**
     * 활동 대상 엔티티 ID
     */
    private Long entityId;

    /**
     * 활동 대상 엔티티 이름
     */
    private String entityName;

    /**
     * 변경 전 값 (JSON 형태)
     */
    private String beforeValue;

    /**
     * 변경 후 값 (JSON 형태)
     */
    private String afterValue;

    /**
     * 사용자 IP 주소
     */
    private String ipAddress;

    /**
     * 사용자 에이전트
     */
    private String userAgent;

    public static ActivityLogEvent create(
            Long userId,
            Long projectId,
            EventType eventType,
            String action,
            String entityType,
            Long entityId,
            String entityName
    ) {
        ActivityLogEvent event = ActivityLogEvent.builder()
                .userId(userId)
                .projectId(projectId)
                .eventType(eventType)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .build();
        event.initEvent();
        return event;
    }

    public static ActivityLogEvent createWithChange(
            Long userId,
            Long projectId,
            EventType eventType,
            String action,
            String entityType,
            Long entityId,
            String entityName,
            String beforeValue,
            String afterValue
    ) {
        ActivityLogEvent event = ActivityLogEvent.builder()
                .userId(userId)
                .projectId(projectId)
                .eventType(eventType)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .beforeValue(beforeValue)
                .afterValue(afterValue)
                .build();
        event.initEvent();
        return event;
    }
}
