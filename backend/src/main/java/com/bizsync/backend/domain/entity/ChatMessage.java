package com.bizsync.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

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
    private Long roomId; // 어떤 방의 메시지인지

    @Column(nullable = false)
    private String sender; // 보낸 사람 (이름 또는 ID)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 내용

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime sentAt; // 전송 시간
}