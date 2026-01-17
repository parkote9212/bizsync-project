package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.ChatMessageDTO;
import com.bizsync.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // 1. 실시간 채팅 처리
    @MessageMapping("/chat/message")
    public void sendMessage(ChatMessageDTO message) {
        // DB 저장
        ChatMessageDTO savedMessage = chatService.saveMessage(message);

        // 구독자 전송 (Record 타입 접근자 수정: .roomId())
        messagingTemplate.convertAndSend("/sub/chat/room/" + savedMessage.roomId(), savedMessage);
    }

    // 2. 채팅 내역 조회
    @GetMapping("/api/chat/room/{roomId}/history")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.getChatHistory(roomId));
    }
}