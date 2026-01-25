package com.bizsync.backend.controller;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.ApprovalStatus;
import com.bizsync.backend.domain.entity.ColumnType;
import com.bizsync.backend.domain.entity.ProjectStatus;
import com.bizsync.backend.domain.entity.Task;
import com.bizsync.backend.domain.repository.ApprovalLineRepository;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.repository.TaskRepository;
import com.bizsync.backend.dto.response.ApiResponse;
import com.bizsync.backend.dto.response.DashboardStatsDTO;
import com.bizsync.backend.dto.response.DashboardTaskDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 대시보드 관련 REST API 컨트롤러
 * 
 * <p>사용자 대시보드 통계 및 내 업무 목록 조회 API를 제공합니다.
 * 
 * @author BizSync Team
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final ApprovalLineRepository approvalLineRepository;

    /**
     * 사용자 대시보드 통계 정보를 조회합니다.
     * 
     * @return 대시보드 통계 (진행 중인 프로젝트 수, 미완료 업무 수, 대기 중인 결재 수)
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();

        long projectCount = projectMemberRepository.countByUser_UserIdAndProject_Status(userId,
                ProjectStatus.IN_PROGRESS);

        long taskCount = taskRepository.countByWorkerIdAndColumnTypeNot(userId, ColumnType.DONE);

        long pendingApprovalCount = approvalLineRepository.countByApprover_UserIdAndStatus(
                userId,
                ApprovalStatus.PENDING);

        return ResponseEntity.ok(ApiResponse.success(
                DashboardStatsDTO.from(projectCount, taskCount, pendingApprovalCount)
        ));
    }

    /**
     * 사용자의 미완료 업무 목록을 조회합니다.
     * 
     * <p>마감일이 가까운 순서로 정렬하여 반환합니다.
     * 
     * @return 미완료 업무 목록
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<ApiResponse<List<DashboardTaskDTO>>> getMyTasks() {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();

        List<DashboardTaskDTO> taskList = taskRepository.findByWorker_UserId(userId).stream()
                .filter(task -> task.getColumn().getColumnType() != ColumnType.DONE)
                .map(DashboardTaskDTO::from)
                .sorted(Comparator.comparing(
                        DashboardTaskDTO::daysLeft,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(taskList));
    }
}
