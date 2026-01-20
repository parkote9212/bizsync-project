package com.bizsync.backend.dto.request;

public record ChatMessageDTO(
        Long roomId,
        String sender,
        String content
) {
}