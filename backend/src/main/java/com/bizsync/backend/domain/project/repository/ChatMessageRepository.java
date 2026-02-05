package com.bizsync.backend.domain.project.repository;

import com.bizsync.backend.domain.project.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    /**
     * 특정 방의 메시지를 시간순으로 조회
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @return 메시지 목록 (오름차순)
     */
    List<ChatMessage> findByRoomIdOrderBySentAtAsc(Long roomId);

    /**
     * 특정 방의 메시지를 페이지네이션으로 조회
     *
     * @param roomId   채팅방 ID (프로젝트 ID)
     * @param pageable 페이지 정보
     * @return 메시지 페이지
     */
    Page<ChatMessage> findByRoomId(Long roomId, Pageable pageable);

    /**
     * 최초 로딩: 가장 최근 N개 메시지 조회 (시간순 오름차순으로 반환)
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @param limit  조회할 메시지 개수
     * @return 메시지 목록 (오래된 것부터 최신순, 오름차순)
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.roomId = :roomId ORDER BY m.sentAt DESC")
    List<ChatMessage> findLatestMessages(@Param("roomId") Long roomId, Pageable pageable);

    /**
     * 이전 메시지 로딩: 특정 시점 이전 N개 메시지 조회 (시간순 오름차순으로 반환)
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @param cursor 커서 (이 시점 이전의 메시지 조회)
     * @param limit  조회할 메시지 개수
     * @return 메시지 목록 (오래된 것부터 최신순, 오름차순)
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.roomId = :roomId AND m.sentAt < :cursor ORDER BY m.sentAt DESC")
    List<ChatMessage> findMessagesBefore(@Param("roomId") Long roomId, @Param("cursor") LocalDateTime cursor, Pageable pageable);

    /**
     * 특정 시점 이전에 더 많은 메시지가 있는지 확인
     *
     * @param roomId 채팅방 ID (프로젝트 ID)
     * @param cursor 커서 (이 시점 이전의 메시지 존재 여부 확인)
     * @return 존재 여부
     */
    @Query("SELECT COUNT(m) > 0 FROM ChatMessage m WHERE m.roomId = :roomId AND m.sentAt < :cursor")
    boolean existsMessagesBefore(@Param("roomId") Long roomId, @Param("cursor") LocalDateTime cursor);
}