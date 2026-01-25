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
    /**
     * 통계 값들로부터 AdminDashboardStatisticsDTO 생성
     */
    public static AdminDashboardStatisticsDTO from(
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
        return new AdminDashboardStatisticsDTO(
                totalUsers,
                pendingUsers,
                activeUsers,
                suspendedUsers,
                deletedUsers,
                adminUsers,
                managerUsers,
                memberUsers,
                totalProjects,
                planningProjects,
                inProgressProjects,
                completedProjects,
                onHoldProjects,
                cancelledProjects,
                totalTasks,
                totalApprovals
        );
    }
}
