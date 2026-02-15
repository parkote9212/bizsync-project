package com.bizsync.backend.domain.notification.repository;

import com.bizsync.backend.domain.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Notification 리포지토리
 *
 * @author BizSync Team
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 사용자의 알림 목록 조회 (페이징)
     *
     * @param recipientId 수신자 ID
     * @param pageable    페이징 정보
     * @return 알림 목록
     */
    Page<Notification> findByRecipient_UserId(Long recipientId, Pageable pageable);

    /**
     * 사용자의 읽지 않은 알림 개수 조회
     *
     * @param recipientId 수신자 ID
     * @return 읽지 않은 알림 개수
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.userId = :recipientId AND n.isRead = false")
    long countUnreadByRecipientId(@Param("recipientId") Long recipientId);

    /**
     * 사용자의 모든 알림을 읽음 처리
     *
     * @param recipientId 수신자 ID
     * @param now         현재 시각
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :now " +
            "WHERE n.recipient.userId = :recipientId AND n.isRead = false")
    void markAllAsReadByRecipientId(@Param("recipientId") Long recipientId, @Param("now") LocalDateTime now);

    /**
     * 특정 기간 이전의 읽은 알림 삭제 (배치 작업용)
     *
     * @param beforeDate 기준 일자
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.readAt < :beforeDate")
    void deleteReadNotificationsBefore(@Param("beforeDate") LocalDateTime beforeDate);
}
