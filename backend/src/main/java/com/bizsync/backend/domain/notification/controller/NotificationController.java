package com.bizsync.backend.domain.notification.controller;

import com.bizsync.backend.domain.notification.dto.NotificationResponse;
import com.bizsync.backend.domain.notification.service.NotificationQueryService;
import com.bizsync.backend.global.common.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 알림 API 컨트롤러
 *
 * @author BizSync Team
 */
@Tag(name = "Notification", description = "알림 API")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationQueryService notificationQueryService;

    @Operation(summary = "알림 목록 조회", description = "현재 사용자의 알림 목록을 조회합니다")
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() -> new com.bizsync.backend.global.common.exception.BusinessException(com.bizsync.backend.global.common.exception.ErrorCode.UNAUTHENTICATED));
        Page<NotificationResponse> notifications = notificationQueryService.getNotifications(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "읽지 않은 알림 개수 조회", description = "현재 사용자의 읽지 않은 알림 개수를 조회합니다")
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() -> new com.bizsync.backend.global.common.exception.BusinessException(com.bizsync.backend.global.common.exception.ErrorCode.UNAUTHENTICATED));
        long count = notificationQueryService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }

    @Operation(summary = "알림 읽음 처리", description = "특정 알림을 읽음 처리합니다")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() -> new com.bizsync.backend.global.common.exception.BusinessException(com.bizsync.backend.global.common.exception.ErrorCode.UNAUTHENTICATED));
        notificationQueryService.markAsRead(userId, notificationId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "모든 알림 읽음 처리", description = "현재 사용자의 모든 알림을 읽음 처리합니다")
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() -> new com.bizsync.backend.global.common.exception.BusinessException(com.bizsync.backend.global.common.exception.ErrorCode.UNAUTHENTICATED));
        notificationQueryService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "알림 삭제", description = "특정 알림을 삭제합니다")
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() -> new com.bizsync.backend.global.common.exception.BusinessException(com.bizsync.backend.global.common.exception.ErrorCode.UNAUTHENTICATED));
        notificationQueryService.deleteNotification(userId, notificationId);
        return ResponseEntity.ok().build();
    }
}
