package com.bizsync.backend.domain.project.dto.response;

import com.bizsync.backend.domain.project.entity.Task;

import java.time.LocalDate;

public record TaskDetailResponseDTO(
        Long taskId,
        String title,
        String content,
        LocalDate deadline,
        String workerName,
        Long workerId,
        String columnName
) {
    /**
     * Task 엔티티에서 DTO로 변환
     */
    public static TaskDetailResponseDTO from(Task task) {
        return new TaskDetailResponseDTO(
                task.getTaskId(),
                task.getTitle(),
                task.getContent(),
                task.getDeadline(),
                task.getWorker() != null ? task.getWorker().getName() : "미배정",
                task.getWorker() != null ? task.getWorker().getUserId() : null,
                task.getColumn().getName()
        );
    }
}