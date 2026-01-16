package com.bizsync.backend.dto.response.kanban;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {
    private Long taskId;
    private String title;
    private String workerName;
    private Integer sequence;
    private LocalDateTime deadline;
}
