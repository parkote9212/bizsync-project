package com.bizsync.backend.dto.request;

import com.bizsync.backend.domain.entity.ChatMessage;

public record ChatMessageDTO(
        Long roomId,
        String sender,
        String content
) {}