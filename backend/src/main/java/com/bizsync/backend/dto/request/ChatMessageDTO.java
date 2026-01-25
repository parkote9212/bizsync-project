package com.bizsync.backend.dto.request;

import com.bizsync.backend.domain.entity.ChatMessage;
import com.bizsync.backend.domain.entity.ChatMessage.MessageType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 채팅 메시지 DTO
 *
 * <p>채팅 메시지 전송 및 조회에 사용되는 DTO입니다.
 */
public record ChatMessageDTO(
        Long id,
        Long roomId,
        Long senderId,
        String senderName,
        String content,
        MessageType messageType,
        LocalDateTime sentAt
) {
    /**
     * ChatMessage Entity -> ChatMessageDTO 변환
     */
    public static ChatMessageDTO from(ChatMessage message) {
        return new ChatMessageDTO(
                message.getId(),
                message.getRoomId(),
                message.getSender().getUserId(),
                message.getSender().getName(),
                message.getContent(),
                message.getMessageType(),
                message.getSentAt()
        );
    }

    /**
     * ChatMessage 리스트 -> ChatMessageDTO 리스트 변환
     */
    public static List<ChatMessageDTO> fromList(List<ChatMessage> messages) {
        return messages.stream()
                .map(ChatMessageDTO::from)
                .toList();
    }
}