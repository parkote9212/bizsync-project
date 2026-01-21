package com.bizsync.backend.controller;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.ApprovalStatus;
import com.bizsync.backend.domain.entity.ColumnType;
import com.bizsync.backend.domain.entity.ProjectStatus;
import com.bizsync.backend.domain.entity.Task;
import com.bizsync.backend.domain.repository.ApprovalLineRepository;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

        private final ProjectMemberRepository projectMemberRepository;
        private final TaskRepository taskRepository;
        private final ApprovalLineRepository approvalLineRepository;

        /**
         * 대시보드 통계 조회
         */
        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getDashboardStats() {
                Long userId = SecurityUtil.getCurrentUserIdOrThrow();

                // 내 진행 중인 프로젝트 수 (IN_PROGRESS 상태만)
                long projectCount = projectMemberRepository.countByUser_UserIdAndProject_Status(userId,
                                ProjectStatus.IN_PROGRESS);

                // 내 진행 중 업무 수 (완료 컬럼이 아닌 업무만)
                long taskCount = taskRepository.countByWorkerIdAndColumnTypeNot(userId, ColumnType.DONE);

                // 내가 승인해야 할 결재 수
                long pendingApprovalCount = approvalLineRepository.countByApprover_UserIdAndStatus(
                                userId,
                                ApprovalStatus.PENDING);

                return ResponseEntity.ok(Map.of(
                                "status", "SUCCESS",
                                "data", Map.of(
                                                "projectCount", projectCount,
                                                "taskCount", taskCount,
                                                "pendingApprovalCount", pendingApprovalCount)));
        }

        /**
         * 내 업무 목록 조회 (완료 컬럼 제외, 마감일 임박 순)
         */
        @GetMapping("/my-tasks")
        public ResponseEntity<Map<String, Object>> getMyTasks() {
                Long userId = SecurityUtil.getCurrentUserIdOrThrow();

                // 완료되지 않은 내 업무 목록 조회
                List<Task> tasks = taskRepository.findByWorker_UserId(userId).stream()
                                .filter(task -> task.getColumn().getColumnType() != ColumnType.DONE)
                                .collect(Collectors.toList());

                // DTO로 변환
                List<Map<String, Object>> taskList = tasks.stream()
                                .map(task -> {
                                        LocalDate deadline = task.getDeadline();
                                        Long daysLeft = null;
                                        if (deadline != null) {
                                                daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), deadline);
                                        }

                                        Map<String, Object> taskMap = new java.util.HashMap<>();
                                        taskMap.put("taskId", task.getTaskId());
                                        taskMap.put("title", task.getTitle());
                                        taskMap.put("projectName", task.getColumn().getProject().getName());
                                        taskMap.put("columnName", task.getColumn().getName());
                                        taskMap.put("dueDate", deadline != null ? deadline.toString() : null);
                                        taskMap.put("daysLeft", daysLeft);
                                        return taskMap;
                                })
                                .sorted((a, b) -> {
                                        // daysLeft로 정렬 (마감일 임박 순)
                                        Long aLeft = (Long) a.get("daysLeft");
                                        Long bLeft = (Long) b.get("daysLeft");

                                        if (aLeft == null)
                                                return 1;
                                        if (bLeft == null)
                                                return -1;

                                        return Long.compare(aLeft, bLeft);
                                })
                                .collect(Collectors.toList());

                return ResponseEntity.ok(Map.of(
                                "status", "SUCCESS",
                                "data", taskList));
        }
}
