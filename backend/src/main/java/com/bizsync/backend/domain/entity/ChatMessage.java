package com.bizsync.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 엔티티
 *
 * <p>프로젝트별 그룹 채팅 메시지를 저장합니다.
 * roomId는 프로젝트 ID를 의미하며, 프로젝트 멤버만 메시지를 주고받을 수 있습니다.
 */
@Entity
@Table(name = "chat_message")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class) // 시간 자동 저장을 위해 필수
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long roomId; // 프로젝트 ID (채팅방 ID)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender; // 보낸 사람 (User FK)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 메시지 내용

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 20)
    @Builder.Default
    private MessageType messageType = MessageType.TEXT; // 메시지 타입

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime sentAt; // 전송 시간

    /**
     * 메시지 타입 열거형
     */
    public enum MessageType {
        TEXT,    // 일반 텍스트 메시지
        FILE,    // 파일 메시지
        SYSTEM   // 시스템 메시지 (예: "XXX님이 입장했습니다")
    }
}