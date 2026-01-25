package com.bizsync.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.UnauthenticatedException;
import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.ChatMessage.MessageType;
import com.bizsync.backend.dto.request.ChatMessageDTO;
import com.bizsync.backend.dto.response.ApiResponse;
import com.bizsync.backend.dto.response.ChatHistoryResponse;
import com.bizsync.backend.service.ChatService;
import com.bizsync.backend.service.PresenceService;
import com.bizsync.backend.service.ProjectMemberService;
import com.bizsync.backend.service.ProjectService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 채팅 관련 REST API 및 WebSocket 메시지 핸들러
 *
 * <p>
 * 채팅 메시지 전송, 내역 조회, 채팅방 목록 조회 등의 API를 제공합니다.
 *
 * @author BizSync Team
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

        private final SimpMessagingTemplate messagingTemplate;
        private final ChatService chatService;
        private final PresenceService presenceService;
        private final ProjectMemberService projectMemberService;
        private final ProjectService projectService;

        /**
         * WebSocket을 통해 채팅 메시지를 전송합니다.
         *
         * <p>
         * WebSocket 메시지 핸들러는 HTTP 요청과 다른 스레드에서 실행되므로
         * SecurityContext가 비어있습니다. 따라서 세션에서 userId를 가져옵니다.
         *
         * @param request        채팅 메시지 요청 (roomId, content만 포함)
         * @param headerAccessor STOMP 메시지 헤더 접근자 (세션 정보 포함)
         */
        @MessageMapping("/chat/message")
        public void sendMessage(
                        @Payload ChatMessageRequest request,
                        SimpMessageHeaderAccessor headerAccessor) {
                // 세션에서 userId 가져오기 (WebSocketAuthInterceptor에서 저장한 값)
                Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
                if (sessionAttributes == null) {
                        log.warn("WebSocket message rejected: Session attributes not found");
                        throw new UnauthenticatedException(ErrorCode.UNAUTHENTICATED);
                }

                Long userId = (Long) sessionAttributes.get("userId");
                if (userId == null) {
                        log.warn("WebSocket message rejected: User ID not found in session");
                        throw new UnauthenticatedException(ErrorCode.UNAUTHENTICATED);
                }

                log.debug("Processing chat message from user: {} for room: {}", userId, request.roomId());

                // userId를 파라미터로 전달하여 메시지 저장
                ChatMessageDTO savedMessage = chatService.saveMessage(
                                request.roomId(),
                                request.content(),
                                request.messageType() != null ? request.messageType() : MessageType.TEXT,
                                userId);

                // 채팅방 구독자에게 메시지 브로드캐스트
                messagingTemplate.convertAndSend("/topic/chat/room/" + savedMessage.roomId(), savedMessage);
        }

        /**
         * 내가 속한 채팅방 목록을 조회합니다.
         *
         * @return 프로젝트 목록 (채팅방 목록)
         */
        @GetMapping("/rooms")
        public ResponseEntity<ApiResponse<List<ChatRoomDTO>>> getMyChatRooms() {
                Long userId = SecurityUtil.getCurrentUserIdOrThrow();
                List<ChatRoomDTO> rooms = projectService.getMyProjects(userId).stream()
                                .map(project -> new ChatRoomDTO(
                                                project.projectId(),
                                                project.name(),
                                                project.description()))
                                .toList();
                return ResponseEntity.ok(ApiResponse.success(rooms));
        }

        /**
         * 특정 채팅방의 메시지 내역을 조회합니다.
         *
         * <p>
         * 커서 기반 페이지네이션을 사용합니다.
         * - 최초 로딩: before 파라미터 없이 호출
         * - 이전 메시지 로딩: before 파라미터에 이전 응답의 oldestCursor 값을 전달
         *
         * @param roomId 채팅방 ID (프로젝트 ID)
         * @param before 커서 (이 시점 이전의 메시지 조회, 선택적)
         * @param limit  조회할 메시지 개수 (기본값: 최초 50, 이전 메시지 20)
         * @return 채팅 히스토리 응답 (메시지 목록, hasMore, oldestCursor)
         */
        @GetMapping("/room/{roomId}/messages")
        public ResponseEntity<ApiResponse<ChatHistoryResponse>> getChatMessages(
                        @PathVariable Long roomId,
                        @RequestParam(required = false) String before,
                        @RequestParam(defaultValue = "0") int limit) {
                ChatHistoryResponse response;

                if (before == null || before.isEmpty()) {
                        // 최초 로딩: 가장 최근 메시지 조회
                        int defaultLimit = limit > 0 ? limit : 50;
                        response = chatService.getRecentMessages(roomId, defaultLimit);
                } else {
                        // 이전 메시지 로딩: 커서 이전의 메시지 조회
                        try {
                                LocalDateTime cursor = LocalDateTime.parse(before);
                                int defaultLimit = limit > 0 ? limit : 20;
                                response = chatService.getMessagesBefore(roomId, cursor, defaultLimit);
                        } catch (Exception e) {
                                // 잘못된 커서 형식인 경우 빈 응답 반환
                                response = ChatHistoryResponse.empty();
                        }
                }

                return ResponseEntity.ok(ApiResponse.success(response));
        }

        /**
         * 특정 채팅방의 멤버 목록과 접속 상태를 조회합니다.
         *
         * @param roomId 채팅방 ID (프로젝트 ID)
         * @return 채팅방 멤버 목록 (접속 상태 포함)
         */
        @GetMapping("/room/{roomId}/members")
        public ResponseEntity<ApiResponse<ChatRoomMembersDTO>> getChatRoomMembers(@PathVariable Long roomId) {
                // 프로젝트 멤버 목록 조회
                var members = projectMemberService.getProjectMembers(roomId);

                // 온라인 사용자 목록 조회
                Set<Long> onlineUserIds = presenceService.getOnlineUsers(roomId);

                List<ChatMemberDTO> memberList = members.stream()
                                .map(member -> new ChatMemberDTO(
                                                member.userId(),
                                                member.name(),
                                                member.email(),
                                                onlineUserIds.contains(member.userId())))
                                .toList();

                return ResponseEntity.ok(ApiResponse.success(new ChatRoomMembersDTO(memberList)));
        }

        /**
         * 채팅 메시지 전송 요청 DTO
         */
        public record ChatMessageRequest(
                        Long roomId,
                        String content,
                        MessageType messageType) {
        }

        /**
         * 채팅방 정보 DTO
         */
        public record ChatRoomDTO(
                        Long roomId,
                        String name,
                        String description) {
        }

        /**
         * 채팅방 멤버 정보 DTO
         */
        public record ChatMemberDTO(
                        Long userId,
                        String name,
                        String email,
                        boolean isOnline) {
        }

        /**
         * 채팅방 멤버 목록 DTO
         */
        public record ChatRoomMembersDTO(
                        List<ChatMemberDTO> members) {
        }
}
