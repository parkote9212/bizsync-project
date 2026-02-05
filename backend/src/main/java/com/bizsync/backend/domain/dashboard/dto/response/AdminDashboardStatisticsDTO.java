package com.bizsync.backend.domain.dashboard.dto.response;

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
        long totalApprovals,
        long staffUsers,
        long seniorUsers,
        long assistantManagerUsers,
        long deputyGeneralManagerUsers,
        long generalManagerUsers,
        long directorUsers,
        long executiveUsers
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
            long totalApprovals,
            long staffUsers,
            long seniorUsers,
            long assistantManagerUsers,
            long deputyGeneralManagerUsers,
            long generalManagerUsers,
            long directorUsers,
            long executiveUsers
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
                totalApprovals,
                staffUsers,
                seniorUsers,
                assistantManagerUsers,
                deputyGeneralManagerUsers,
                generalManagerUsers,
                directorUsers,
                executiveUsers
        );
    }
}
