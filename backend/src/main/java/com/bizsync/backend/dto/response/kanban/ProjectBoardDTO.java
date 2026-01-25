package com.bizsync.backend.dto.response.kanban;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private LocalDate startDate;
    private LocalDate endDate;
    private String status; // 프로젝트 상태
    private String myRole; // 현재 사용자의 프로젝트 내 역할 (PL, MEMBER)
    private List<KanbanColumnDTO> columns; // 1 : N
}
