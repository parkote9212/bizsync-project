package com.bizsync.backend.service;

import com.bizsync.backend.domain.entity.ChatMessage;
import com.bizsync.backend.domain.repository.ChatMessageRepository;
import com.bizsync.backend.dto.request.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    /**
     * 메시지 저장
     */
    public ChatMessageDTO saveMessage(ChatMessageDTO dto) {
        ChatMessage message = ChatMessage.builder()
                .roomId(dto.roomId())
                .sender(dto.sender())
                .content(dto.content())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        return new ChatMessageDTO(
                saved.getRoomId(),
                saved.getSender(),
                saved.getContent()
        );
    }

    /**
     * 채팅 내역 조회
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getChatHistory(Long roomId) {
        return chatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId).stream()
                .map(msg -> new ChatMessageDTO(
                        msg.getRoomId(),
                        msg.getSender(),
                        msg.getContent()
                ))
                .toList();
    }

}
