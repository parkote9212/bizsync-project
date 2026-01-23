package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.ChatMessageDTO;
import com.bizsync.backend.dto.response.ApiResponse;
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

    @MessageMapping("/chat/message")
    public void sendMessage(ChatMessageDTO message) {
        ChatMessageDTO savedMessage = chatService.saveMessage(message);
        messagingTemplate.convertAndSend("/sub/chat/room/" + savedMessage.roomId(), savedMessage);
    }

    @GetMapping("/api/chat/room/{roomId}/history")
    public ResponseEntity<ApiResponse<List<ChatMessageDTO>>> getChatHistory(@PathVariable Long roomId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getChatHistory(roomId)));
    }
}