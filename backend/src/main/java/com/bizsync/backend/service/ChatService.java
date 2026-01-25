package com.bizsync.backend.service;

import com.bizsync.backend.domain.entity.ChatMessage;
import com.bizsync.backend.domain.repository.ChatMessageRepository;
import com.bizsync.backend.dto.request.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스
 *
 * <p>채팅 메시지 저장 및 조회 기능을 제공합니다.
 *
 * @author BizSync Team
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    /**
     * 채팅 메시지를 저장합니다.
     *
     * @param dto 채팅 메시지 DTO
     * @return 저장된 채팅 메시지 DTO
     */
    public ChatMessageDTO saveMessage(ChatMessageDTO dto) {
        ChatMessage message = ChatMessage.builder()
                .roomId(dto.roomId())
                .sender(dto.sender())
                .content(dto.content())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        return ChatMessageDTO.from(saved);
    }

    /**
     * 특정 채팅방의 메시지 내역을 조회합니다.
     *
     * @param roomId 채팅방 ID
     * @return 채팅 메시지 목록 (시간순 정렬)
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getChatHistory(Long roomId) {
        return ChatMessageDTO.fromList(
                chatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId)
        );
    }

}
