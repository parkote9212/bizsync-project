package com.bizsync.backend.service;

import com.bizsync.backend.domain.entity.ApprovalStatus;
import com.bizsync.backend.domain.entity.ColumnType;
import com.bizsync.backend.domain.entity.ProjectStatus;
import com.bizsync.backend.domain.repository.ApprovalLineRepository;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.repository.TaskRepository;
import com.bizsync.backend.dto.response.DashboardStatsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 대시보드 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final ApprovalLineRepository approvalLineRepository;

    /**
     * 사용자 대시보드 통계 정보를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 대시보드 통계 (진행 중인 프로젝트 수, 미완료 업무 수, 대기 중인 결재 수)
     */
    @Cacheable(value = "dashboardStats", key = "#userId")
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(Long userId) {
        long projectCount = projectMemberRepository.countByUser_UserIdAndProject_Status(userId,
                ProjectStatus.IN_PROGRESS);

        long taskCount = taskRepository.countByWorkerIdAndColumnTypeNot(userId, ColumnType.DONE);

        long pendingApprovalCount = approvalLineRepository.countByApprover_UserIdAndStatus(
                userId,
                ApprovalStatus.PENDING);

        return DashboardStatsDTO.from(projectCount, taskCount, pendingApprovalCount);
    }
}
