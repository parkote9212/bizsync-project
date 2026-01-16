package com.bizsync.backend.dto.response.kanban;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanbanColumnDTO {
    private Long columnId;
    private String name;
    private Integer sequence;
    private List<TaskDTO> tasks; // 1:N
}
