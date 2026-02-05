package com.bizsync.backend.domain.dashboard.service;

import com.bizsync.backend.domain.approval.repository.ApprovalDocumentRepository;
import com.bizsync.backend.domain.dashboard.dto.response.AdminDashboardStatisticsDTO;
import com.bizsync.backend.domain.project.entity.ProjectStatus;
import com.bizsync.backend.domain.project.repository.ProjectRepository;
import com.bizsync.backend.domain.project.repository.TaskRepository;
import com.bizsync.backend.domain.user.entity.AccountStatus;
import com.bizsync.backend.domain.user.entity.Position;
import com.bizsync.backend.domain.user.entity.Role;
import com.bizsync.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
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

    /**
     * 관리자 대시보드 통계 정보를 조회합니다.
     *
     * @return 대시보드 통계 DTO (사용자, 프로젝트, 업무, 결재 통계 포함)
     */
    @Cacheable(value = "adminDashboardStats", key = "'global'")
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

        // 직급별 통계
        long staffUsers = userRepository.countByPosition(Position.STAFF);
        long seniorUsers = userRepository.countByPosition(Position.SENIOR);
        long assistantManagerUsers = userRepository.countByPosition(Position.ASSISTANT_MANAGER);
        long deputyGeneralManagerUsers = userRepository.countByPosition(Position.DEPUTY_GENERAL_MANAGER);
        long generalManagerUsers = userRepository.countByPosition(Position.GENERAL_MANAGER);
        long directorUsers = userRepository.countByPosition(Position.DIRECTOR);
        long executiveUsers = userRepository.countByPosition(Position.EXECUTIVE);

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
