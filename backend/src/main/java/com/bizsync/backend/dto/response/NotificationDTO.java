package com.bizsync.backend.dto.response;

public record NotificationDTO(
        String type,    // 알림 유형 (예: APPROVAL, TASK, SYSTEM)
        String message, // 알림 내용 (예: "휴가 신청서가 승인되었습니다.")
        Long targetId   // 클릭 시 이동할 ID (예: 문서 ID, 업무 ID)
) {
}