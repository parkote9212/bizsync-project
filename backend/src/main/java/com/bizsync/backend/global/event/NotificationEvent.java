package com.bizsync.backend.global.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 알림 이벤트
 * 사용자에게 알림을 전송할 때 발행되는 이벤트
 *
 * @author BizSync Team
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NotificationEvent extends EventMessage {

    /**
     * 알림을 받을 사용자 ID
     */
    private Long recipientId;

    /**
     * 알림 제목
     */
    private String title;

    /**
     * 알림 내용
     */
    private String message;

    /**
     * 관련 엔티티 타입 (예: PROJECT, TASK, APPROVAL)
     */
    private String entityType;

    /**
     * 관련 엔티티 ID
     */
    private Long entityId;

    /**
     * 알림 URL (클릭 시 이동할 URL)
     */
    private String url;

    public static NotificationEvent create(
            Long userId,
            Long recipientId,
            EventType eventType,
            String title,
            String message,
            String entityType,
            Long entityId,
            String url
    ) {
        NotificationEvent event = NotificationEvent.builder()
                .userId(userId)
                .recipientId(recipientId)
                .eventType(eventType)
                .title(title)
                .message(message)
                .entityType(entityType)
                .entityId(entityId)
                .url(url)
                .build();
        event.initEvent();
        return event;
    }
}
