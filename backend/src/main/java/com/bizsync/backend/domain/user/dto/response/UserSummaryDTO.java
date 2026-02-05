package com.bizsync.backend.domain.user.dto.response;

import com.bizsync.backend.domain.user.entity.User;

/**
 * 사용자 목록 조회용 간단한 DTO
 */
public record UserSummaryDTO(
        Long userId,
        String name,
        String email,
        String department,
        String role,
        String position
) {
    /**
     * User 엔티티 -> UserSummaryDTO 변환
     */
    public static UserSummaryDTO from(User user) {
        return new UserSummaryDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment() != null ? user.getDepartment() : "",
                user.getRole().name(),
                user.getPosition() != null ? user.getPosition().getKorean() : ""
        );
    }
}
