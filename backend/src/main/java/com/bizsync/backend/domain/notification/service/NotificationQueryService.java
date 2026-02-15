package com.bizsync.backend.domain.notification.service;

import com.bizsync.backend.domain.notification.dto.NotificationResponse;
import com.bizsync.backend.domain.notification.entity.Notification;
import com.bizsync.backend.domain.notification.repository.NotificationRepository;
import com.bizsync.backend.global.common.exception.BusinessException;
import com.bizsync.backend.global.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 알림 조회/관리 서비스 (Kafka 기반)
 *
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationQueryService {

    private final NotificationRepository notificationRepository;

    /**
     * 사용자의 알림 목록 조회
     *
     * @param userId   사용자 ID
     * @param pageable 페이징 정보
     * @return 알림 목록
     */
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByRecipient_UserId(userId, pageable);
        return notifications.map(NotificationResponse::from);
    }

    /**
     * 읽지 않은 알림 개수 조회
     *
     * @param userId 사용자 ID
     * @return 읽지 않은 알림 개수
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByRecipientId(userId);
    }

    /**
     * 알림 읽음 처리
     *
     * @param userId         사용자 ID
     * @param notificationId 알림 ID
     */
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // 본인의 알림인지 확인
        if (!notification.getRecipient().getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        // 이미 읽음 처리된 경우 무시
        if (!notification.getIsRead()) {
            notification.markAsRead();
            log.info("알림 읽음 처리: notificationId={}, userId={}", notificationId, userId);
        }
    }

    /**
     * 모든 알림 읽음 처리
     *
     * @param userId 사용자 ID
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByRecipientId(userId, LocalDateTime.now());
        log.info("모든 알림 읽음 처리: userId={}", userId);
    }

    /**
     * 알림 삭제
     *
     * @param userId         사용자 ID
     * @param notificationId 알림 ID
     */
    @Transactional
    public void deleteNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // 본인의 알림인지 확인
        if (!notification.getRecipient().getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        notificationRepository.delete(notification);
        log.info("알림 삭제: notificationId={}, userId={}", notificationId, userId);
    }
}
