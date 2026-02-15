package com.bizsync.backend.domain.activitylog.dto;

import com.bizsync.backend.domain.activitylog.entity.ActivityLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 활동 로그 응답 DTO
 *
 * @author BizSync Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {

    private Long logId;
    private Long userId;
    private String userName;
    private Long projectId;
    private String projectName;
    private String action;
    private String entityType;
    private Long entityId;
    private String entityName;
    private String beforeValue;
    private String afterValue;
    private LocalDateTime createdAt;

    public static ActivityLogResponse from(ActivityLog log) {
        return ActivityLogResponse.builder()
                .logId(log.getLogId())
                .userId(log.getUser().getUserId())
                .userName(log.getUser().getName())
                .projectId(log.getProject() != null ? log.getProject().getProjectId() : null)
                .projectName(log.getProject() != null ? log.getProject().getName() : null)
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .entityName(log.getEntityName())
                .beforeValue(log.getBeforeValue())
                .afterValue(log.getAfterValue())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
