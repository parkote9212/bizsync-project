package com.bizsync.backend.dto.response;

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
}
