package com.bizsync.backend.domain.project.dto.response;

import com.bizsync.backend.domain.project.dto.request.ChatMessageDTO;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 채팅 히스토리 응답 DTO
 *
 * <p>커서 기반 페이지네이션을 위한 응답 형식입니다.
 */
public record ChatHistoryResponse(
        List<ChatMessageDTO> messages,
        boolean hasMore,
        LocalDateTime oldestCursor
) {
    /**
     * 빈 응답 생성 (메시지가 없을 때)
     */
    public static ChatHistoryResponse empty() {
        return new ChatHistoryResponse(List.of(), false, null);
    }
}
