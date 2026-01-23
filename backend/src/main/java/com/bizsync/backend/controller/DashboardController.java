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
import com.bizsync.backend.dto.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

        private final ProjectMemberRepository projectMemberRepository;
        private final TaskRepository taskRepository;
        private final ApprovalLineRepository approvalLineRepository;

        @GetMapping("/stats")
        public ResponseEntity<ApiResponse<Map<String, Long>>> getDashboardStats() {
                Long userId = SecurityUtil.getCurrentUserIdOrThrow();

                long projectCount = projectMemberRepository.countByUser_UserIdAndProject_Status(userId,
                                ProjectStatus.IN_PROGRESS);

                long taskCount = taskRepository.countByWorkerIdAndColumnTypeNot(userId, ColumnType.DONE);

                long pendingApprovalCount = approvalLineRepository.countByApprover_UserIdAndStatus(
                                userId,
                                ApprovalStatus.PENDING);

                return ResponseEntity.ok(ApiResponse.success(Map.of(
                                "projectCount", projectCount,
                                "taskCount", taskCount,
                                "pendingApprovalCount", pendingApprovalCount)));
        }

        @GetMapping("/my-tasks")
        public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyTasks() {
                Long userId = SecurityUtil.getCurrentUserIdOrThrow();

                List<Task> tasks = taskRepository.findByWorker_UserId(userId).stream()
                                .filter(task -> task.getColumn().getColumnType() != ColumnType.DONE)
                                .collect(Collectors.toList());

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
                                        Long aLeft = (Long) a.get("daysLeft");
                                        Long bLeft = (Long) b.get("daysLeft");

                                        if (aLeft == null)
                                                return 1;
                                        if (bLeft == null)
                                                return -1;

                                        return Long.compare(aLeft, bLeft);
                                })
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.success(taskList));
        }
}
