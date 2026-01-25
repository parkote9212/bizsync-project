package com.bizsync.backend.dto.response;

import com.bizsync.backend.domain.entity.Task;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * 대시보드 내 업무 목록 조회용 DTO
 */
public record DashboardTaskDTO(
        Long taskId,
        String title,
        String projectName,
        String columnName,
        String dueDate,
        Long daysLeft
) {
    /**
     * Task Entity -> DashboardTaskDTO 변환
     */
    public static DashboardTaskDTO from(Task task) {
        LocalDate deadline = task.getDeadline();
        Long daysLeft = null;
        if (deadline != null) {
            daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), deadline);
        }

        return new DashboardTaskDTO(
                task.getTaskId(),
                task.getTitle(),
                task.getColumn().getProject().getName(),
                task.getColumn().getName(),
                deadline != null ? deadline.toString() : null,
                daysLeft
        );
    }
}
