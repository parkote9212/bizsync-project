package com.bizsync.backend.domain.activitylog.controller;

import com.bizsync.backend.domain.activitylog.dto.ActivityLogResponse;
import com.bizsync.backend.domain.activitylog.service.ActivityLogQueryService;
import com.bizsync.backend.global.common.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 활동 로그 API 컨트롤러
 *
 * @author BizSync Team
 */
@Tag(name = "ActivityLog", description = "활동 로그 API")
@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogQueryService activityLogQueryService;

    @Operation(summary = "프로젝트 활동 로그 조회", description = "특정 프로젝트의 활동 로그를 조회합니다")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<Page<ActivityLogResponse>> getProjectActivityLogs(
            @PathVariable Long projectId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ActivityLogResponse> logs = activityLogQueryService.getProjectActivityLogs(projectId, pageable);
        return ResponseEntity.ok(logs);
    }

    @Operation(summary = "사용자 활동 로그 조회", description = "현재 사용자의 활동 로그를 조회합니다")
    @GetMapping("/my")
    public ResponseEntity<Page<ActivityLogResponse>> getMyActivityLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() -> new com.bizsync.backend.global.common.exception.BusinessException(com.bizsync.backend.global.common.exception.ErrorCode.UNAUTHENTICATED));
        Page<ActivityLogResponse> logs = activityLogQueryService.getUserActivityLogs(userId, pageable);
        return ResponseEntity.ok(logs);
    }

    @Operation(summary = "엔티티 활동 로그 조회", description = "특정 엔티티(Task, Approval 등)의 활동 로그를 조회합니다")
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<Page<ActivityLogResponse>> getEntityActivityLogs(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ActivityLogResponse> logs = activityLogQueryService.getEntityActivityLogs(entityType, entityId, pageable);
        return ResponseEntity.ok(logs);
    }

    @Operation(summary = "최근 프로젝트 활동 조회", description = "프로젝트의 최근 활동을 제한된 개수만큼 조회합니다")
    @GetMapping("/project/{projectId}/recent")
    public ResponseEntity<List<ActivityLogResponse>> getRecentProjectActivity(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<ActivityLogResponse> logs = activityLogQueryService.getRecentProjectActivity(projectId, limit);
        return ResponseEntity.ok(logs);
    }
}
