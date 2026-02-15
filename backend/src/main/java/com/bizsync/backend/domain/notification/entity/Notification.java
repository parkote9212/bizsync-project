package com.bizsync.backend.domain.notification.entity;

import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.global.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 알림 엔티티
 *
 * @author BizSync Team
 */
@Entity
@Table(name = "notification", indexes = {
        @Index(name = "idx_recipient_is_read", columnList = "recipient_id, is_read"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notification extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    /**
     * 알림을 받은 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /**
     * 알림을 발생시킨 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    /**
     * 알림 제목
     */
    @Column(nullable = false, length = 200)
    private String title;

    /**
     * 알림 내용
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * 관련 엔티티 타입 (PROJECT, TASK, APPROVAL 등)
     */
    @Column(name = "entity_type", length = 50)
    private String entityType;

    /**
     * 관련 엔티티 ID
     */
    @Column(name = "entity_id")
    private Long entityId;

    /**
     * 알림 클릭 시 이동할 URL
     */
    @Column(length = 500)
    private String url;

    /**
     * 읽음 여부
     */
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    /**
     * 읽은 시각
     */
    @Column(name = "read_at")
    private java.time.LocalDateTime readAt;

    /**
     * 알림 읽음 처리
     */
    public void markAsRead() {
        this.isRead = true;
        this.readAt = java.time.LocalDateTime.now();
    }
}
