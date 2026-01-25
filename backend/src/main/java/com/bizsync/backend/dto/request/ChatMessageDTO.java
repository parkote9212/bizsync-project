package com.bizsync.backend.dto.request;

import com.bizsync.backend.domain.entity.ChatMessage;

import java.util.List;

public record ChatMessageDTO(
        Long roomId,
        String sender,
        String content
) {
    /**
     * ChatMessage Entity -> ChatMessageDTO 변환
     */
    public static ChatMessageDTO from(ChatMessage message) {
        return new ChatMessageDTO(
                message.getRoomId(),
                message.getSender(),
                message.getContent()
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