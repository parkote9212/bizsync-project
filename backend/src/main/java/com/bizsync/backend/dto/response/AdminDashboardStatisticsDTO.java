package com.bizsync.backend.dto.response;

public record AdminDashboardStatisticsDTO(
        long totalUsers,
        long pendingUsers,
        long activeUsers,
        long suspendedUsers,
        long deletedUsers,
        long adminUsers,
        long managerUsers,
        long memberUsers,
        long totalProjects,
        long planningProjects,
        long inProgressProjects,
        long completedProjects,
        long onHoldProjects,
        long cancelledProjects,
        long totalTasks,
        long totalApprovals
) {
}
