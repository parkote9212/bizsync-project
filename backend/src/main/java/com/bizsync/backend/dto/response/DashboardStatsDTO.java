package com.bizsync.backend.dto.response;

/**
 * 대시보드 통계 정보 DTO
 */
public record DashboardStatsDTO(
        Long projectCount,
        Long taskCount,
        Long pendingApprovalCount
) {
    /**
     * 통계 값들로부터 DashboardStatsDTO 생성
     */
    public static DashboardStatsDTO from(long projectCount, long taskCount, long pendingApprovalCount) {
        return new DashboardStatsDTO(projectCount, taskCount, pendingApprovalCount);
    }
}
