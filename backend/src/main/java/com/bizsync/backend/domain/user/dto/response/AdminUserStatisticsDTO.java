package com.bizsync.backend.domain.user.dto.response;

public record AdminUserStatisticsDTO(
        long totalUsers,
        long pendingUsers,
        long activeUsers,
        long suspendedUsers,
        long deletedUsers,
        long adminUsers,
        long managerUsers,
        long memberUsers
) {
    /**
     * 통계 값들로부터 AdminUserStatisticsDTO 생성
     */
    public static AdminUserStatisticsDTO from(
            long totalUsers,
            long pendingUsers,
            long activeUsers,
            long suspendedUsers,
            long deletedUsers,
            long adminUsers,
            long managerUsers,
            long memberUsers
    ) {
        return new AdminUserStatisticsDTO(
                totalUsers,
                pendingUsers,
                activeUsers,
                suspendedUsers,
                deletedUsers,
                adminUsers,
                managerUsers,
                memberUsers
        );
    }
}
