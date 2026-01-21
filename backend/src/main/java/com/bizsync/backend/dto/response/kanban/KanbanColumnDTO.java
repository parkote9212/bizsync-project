package com.bizsync.backend.dto.response.kanban;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanbanColumnDTO {
    private Long columnId;
    private String name;
    private Integer sequence;
    private String columnType; // TODO, IN_PROGRESS, DONE
    private List<TaskDTO> tasks; // 1:N
}
