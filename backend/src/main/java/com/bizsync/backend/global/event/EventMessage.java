package com.bizsync.backend.global.event;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 이벤트 메시지 기본 클래스
 * Kafka를 통해 전송되는 모든 이벤트의 부모 클래스
 *
 * @author BizSync Team
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "eventClass"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = NotificationEvent.class, name = "NotificationEvent"),
        @JsonSubTypes.Type(value = ActivityLogEvent.class, name = "ActivityLogEvent"),
        @JsonSubTypes.Type(value = ApprovalEvent.class, name = "ApprovalEvent")
})
public abstract class EventMessage {

    /**
     * 이벤트 고유 ID (UUID)
     */
    private String eventId;

    /**
     * 이벤트 타입
     */
    private EventType eventType;

    /**
     * 이벤트 발생 시각
     */
    private LocalDateTime timestamp;

    /**
     * 이벤트 발생시킨 사용자 ID
     */
    private Long userId;

    /**
     * 프로젝트 ID (프로젝트 관련 이벤트인 경우)
     */
    private Long projectId;

    /**
     * 이벤트 초기화 (빌더 사용 시 기본값 설정)
     */
    protected void initEvent() {
        if (this.eventId == null) {
            this.eventId = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}
