package com.bizsync.backend.domain.project.dto.response.kanban;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {
    private Long taskId;
    private String title;
    private String content;
    private String workerName;
    private Long workerId;
    private Integer sequence;
    private LocalDate deadline;
}
