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

/**
 * 채팅 관련 REST API 컨트롤러
 * 
 * <p>채팅 메시지 전송 및 내역 조회 API를 제공합니다.
 * 
 * @author BizSync Team
 */
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    /**
     * WebSocket을 통해 채팅 메시지를 전송합니다.
     * 
     * @param message 채팅 메시지 DTO
     */
    @MessageMapping("/chat/message")
    public void sendMessage(ChatMessageDTO message) {
        ChatMessageDTO savedMessage = chatService.saveMessage(message);
        messagingTemplate.convertAndSend("/sub/chat/room/" + savedMessage.roomId(), savedMessage);
    }

    /**
     * 특정 채팅방의 메시지 내역을 조회합니다.
     * 
     * @param roomId 채팅방 ID
     * @return 채팅 메시지 목록
     */
    @GetMapping("/api/chat/room/{roomId}/history")
    public ResponseEntity<ApiResponse<List<ChatMessageDTO>>> getChatHistory(@PathVariable Long roomId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getChatHistory(roomId)));
    }
}