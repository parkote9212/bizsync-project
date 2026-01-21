package com.bizsync.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.ApprovalStatus;
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

                // 내 프로젝트 수
                long projectCount = projectMemberRepository.countByUser_UserId(userId);

                // 내 진행 중 업무 수
                long taskCount = taskRepository.countByWorker_UserId(userId);

                // 내가 승인해야 할 결재 수
                long pendingApprovalCount = approvalLineRepository.countByApprover_UserIdAndStatus(
                                userId,
                                ApprovalStatus.PENDING);

                return ResponseEntity.ok(Map.of(
                                "status", "SUCCESS",
                                "data", Map.of(
                                                "projectCount", projectCount,
                                                "taskCount", taskCount,
                                                "pendingApprovalCount", pendingApprovalCount),
                                "message", null));
        }
}
