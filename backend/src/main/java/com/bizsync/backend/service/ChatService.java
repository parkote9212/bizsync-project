package com.bizsync.backend.service;

import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ForbiddenException;
import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.ChatMessage;
import com.bizsync.backend.domain.entity.ChatMessage.MessageType;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.ChatMessageRepository;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.ChatMessageDTO;
import com.bizsync.backend.dto.response.ChatHistoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스
 *
 * <p>
 * 채팅 메시지 저장 및 조회 기능을 제공합니다.
 * 프로젝트 멤버만 메시지를 주고받을 수 있습니다.
 * 커서 기반 페이지네이션을 사용하여 효율적인 메시지 조회를 제공합니다.
 *
 * @author BizSync Team
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    /**
     * 채팅 메시지를 저장합니다.
     *
     * <p>
     * 프로젝트 멤버만 메시지를 전송할 수 있습니다.
     *
     * @param roomId      채팅방 ID (프로젝트 ID)
     * @param content     메시지 내용
     * @param messageType 메시지 타입
     * @param userId      전송자 사용자 ID (WebSocket에서는 세션에서 가져옴)
     * @return 저장된 채팅 메시지 DTO
     * @throws ForbiddenException 프로젝트 멤버가 아닌 경우
     */
    public ChatMessageDTO saveMessage(Long roomId, String content, MessageType messageType, Long userId) {
        // 프로젝트 멤버 권한 검증
        if (!projectMemberRepository.existsByProjectAndUser(roomId, userId)) {
            throw new ForbiddenException(ErrorCode.PROJECT_PERMISSION_DENIED);
        }

        User sender = userRepository.findByIdOrThrow(userId);

        ChatMessage message = ChatMessage.builder()
                .roomId(roomId)
                .sender(sender)
                .content(content)
                .messageType(messageType != null ? messageType : MessageType.TEXT)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        return ChatMessageDTO.from(saved);
    }

    /**
     * 최초 로딩: 가장 최근 N개 메시지를 조회합니다.
     *
     * <p>
     * 프로젝트 멤버만 메시지 내역을 조회할 수 있습니다.
     * 시간순 오름차순으로 반환되어 UI에서 바로 표시 가능합니다.
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @param limit  조회할 메시지 개수 (기본값: 50)
     * @return 채팅 히스토리 응답 (메시지 목록, hasMore, oldestCursor)
     * @throws ForbiddenException 프로젝트 멤버가 아닌 경우
     */
    @Transactional(readOnly = true)
    public ChatHistoryResponse getRecentMessages(Long roomId, int limit) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();

        // 프로젝트 멤버 권한 검증
        if (!projectMemberRepository.existsByProjectAndUser(roomId, userId)) {
            throw new ForbiddenException(ErrorCode.PROJECT_PERMISSION_DENIED);
        }

        // 최신순으로 limit + 1개 조회 (hasMore 판단용)
        Pageable pageable = PageRequest.of(0, limit + 1);
        List<ChatMessage> messages = chatMessageRepository.findLatestMessages(roomId, pageable);

        if (messages.isEmpty()) {
            return ChatHistoryResponse.empty();
        }

        // hasMore 판단: limit + 1개 조회했으므로, limit개보다 많으면 hasMore = true
        boolean hasMore = messages.size() > limit;
        List<ChatMessage> resultMessages = hasMore ? messages.subList(0, limit) : messages;

        // DESC로 조회했으므로 역순으로 변환하여 오래된 것부터 표시 (오름차순)
        Collections.reverse(resultMessages);

        // 가장 오래된 메시지의 sentAt을 커서로 사용
        LocalDateTime oldestCursor = resultMessages.isEmpty()
                ? null
                : resultMessages.get(0).getSentAt();

        // 이전 메시지가 더 있는지 확인
        if (oldestCursor != null) {
            hasMore = chatMessageRepository.existsMessagesBefore(roomId, oldestCursor);
        }

        return new ChatHistoryResponse(
                ChatMessageDTO.fromList(resultMessages),
                hasMore,
                oldestCursor);
    }

    /**
     * 이전 메시지 로딩: 특정 시점 이전 N개 메시지를 조회합니다.
     *
     * <p>프로젝트 멤버만 메시지 내역을 조회할 수 있습니다.
     * 스크롤 업(이전 메시지 로딩) 시 사용됩니다.
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @param cursor 커서 (이 시점 이전의 메시지 조회)
     * @param limit  조회할 메시지 개수 (기본값: 20)
     * @return 채팅 히스토리 응답 (메시지 목록, hasMore, oldestCursor)
     * @throws ForbiddenException 프로젝트 멤버가 아닌 경우
     */
    @Transactional(readOnly = true)
    public ChatHistoryResponse getMessagesBefore(Long roomId, LocalDateTime cursor, int limit) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();

        // 프로젝트 멤버 권한 검증
        if (!projectMemberRepository.existsByProjectAndUser(roomId, userId)) {
            throw new ForbiddenException(ErrorCode.PROJECT_PERMISSION_DENIED);
        }

        // cursor 이전의 메시지를 limit + 1개 조회 (hasMore 판단용)
        Pageable pageable = PageRequest.of(0, limit + 1);
        List<ChatMessage> messages = chatMessageRepository.findMessagesBefore(roomId, cursor, pageable);

        if (messages.isEmpty()) {
            return ChatHistoryResponse.empty();
        }

        // hasMore 판단: limit + 1개 조회했으므로, limit개보다 많으면 hasMore = true
        boolean hasMore = messages.size() > limit;
        List<ChatMessage> resultMessages = hasMore ? messages.subList(0, limit) : messages;

        // DESC로 조회했으므로 역순으로 변환하여 오래된 것부터 표시 (오름차순)
        Collections.reverse(resultMessages);

        // 가장 오래된 메시지의 sentAt을 커서로 사용
        LocalDateTime oldestCursor = resultMessages.isEmpty()
                ? null
                : resultMessages.get(0).getSentAt();

        // 이전 메시지가 더 있는지 확인
        if (oldestCursor != null) {
            hasMore = chatMessageRepository.existsMessagesBefore(roomId, oldestCursor);
        }

        return new ChatHistoryResponse(
                ChatMessageDTO.fromList(resultMessages),
                hasMore,
                oldestCursor
        );
    }
}
