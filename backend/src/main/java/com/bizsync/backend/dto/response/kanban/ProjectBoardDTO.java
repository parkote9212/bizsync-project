package com.bizsync.backend.dto.response.kanban;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectBoardDTO {
    private Long projectId;
    private String name;
    private BigDecimal totalBudget;
    private BigDecimal usedBudget;
    private List<KanbanColumnDTO> columns; // 1 : N
}
