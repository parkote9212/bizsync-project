package com.bizsync.backend.service;

import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.ProjectStatus;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.domain.repository.*;
import com.bizsync.backend.dto.response.AdminDashboardStatisticsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 대시보드 통계 관련 비즈니스 로직을 처리하는 서비스
 * 
 * <p>사용자, 프로젝트, 업무, 결재 등의 통계 정보를 제공합니다.
 * 
 * @author BizSync Team
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ApprovalDocumentRepository approvalDocumentRepository;
    private final ProjectMemberRepository projectMemberRepository;

    /**
     * 관리자 대시보드 통계 정보를 조회합니다.
     * 
     * @return 대시보드 통계 DTO (사용자, 프로젝트, 업무, 결재 통계 포함)
     */
    public AdminDashboardStatisticsDTO getDashboardStatistics() {
        long totalUsers = userRepository.count();
        long pendingUsers = userRepository.countByStatus(AccountStatus.PENDING);
        long activeUsers = userRepository.countByStatus(AccountStatus.ACTIVE);
        long suspendedUsers = userRepository.countByStatus(AccountStatus.SUSPENDED);
        long deletedUsers = userRepository.countByStatus(AccountStatus.DELETED);
        long adminUsers = userRepository.countByRole(Role.ADMIN);
        long managerUsers = userRepository.countByRole(Role.MANAGER);
        long memberUsers = userRepository.countByRole(Role.MEMBER);

        long totalProjects = projectRepository.count();
        long planningProjects = projectRepository.countByStatus(ProjectStatus.PLANNING);
        long inProgressProjects = projectRepository.countByStatus(ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByStatus(ProjectStatus.COMPLETED);
        long onHoldProjects = projectRepository.countByStatus(ProjectStatus.ON_HOLD);
        long cancelledProjects = projectRepository.countByStatus(ProjectStatus.CANCELLED);

        long totalTasks = taskRepository.count();
        long totalApprovals = approvalDocumentRepository.count();

        return AdminDashboardStatisticsDTO.from(
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
