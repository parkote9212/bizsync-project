package com.bizsync.backend.domain.activitylog.service;

import com.bizsync.backend.domain.activitylog.dto.ActivityLogResponse;
import com.bizsync.backend.domain.activitylog.entity.ActivityLog;
import com.bizsync.backend.domain.activitylog.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 활동 로그 조회 서비스
 *
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityLogQueryService {

    private final ActivityLogRepository activityLogRepository;

    /**
     * 프로젝트의 활동 로그 조회
     *
     * @param projectId 프로젝트 ID
     * @param pageable  페이징 정보
     * @return 활동 로그 목록
     */
    public Page<ActivityLogResponse> getProjectActivityLogs(Long projectId, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByProject_ProjectId(projectId, pageable);
        return logs.map(ActivityLogResponse::from);
    }

    /**
     * 사용자의 활동 로그 조회
     *
     * @param userId   사용자 ID
     * @param pageable 페이징 정보
     * @return 활동 로그 목록
     */
    public Page<ActivityLogResponse> getUserActivityLogs(Long userId, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByUser_UserId(userId, pageable);
        return logs.map(ActivityLogResponse::from);
    }

    /**
     * 특정 엔티티의 활동 로그 조회
     *
     * @param entityType 엔티티 타입
     * @param entityId   엔티티 ID
     * @param pageable   페이징 정보
     * @return 활동 로그 목록
     */
    public Page<ActivityLogResponse> getEntityActivityLogs(String entityType, Long entityId, Pageable pageable) {
        Page<ActivityLog> logs = activityLogRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable);
        return logs.map(ActivityLogResponse::from);
    }

    /**
     * 최근 프로젝트 활동 조회 (TOP N)
     *
     * @param projectId 프로젝트 ID
     * @param limit     제한 개수
     * @return 활동 로그 목록
     */
    public List<ActivityLogResponse> getRecentProjectActivity(Long projectId, int limit) {
        Pageable pageable = Pageable.ofSize(limit);
        List<ActivityLog> logs = activityLogRepository.findRecentByProjectId(projectId, pageable);
        return logs.stream()
                .map(ActivityLogResponse::from)
                .collect(Collectors.toList());
    }
}
