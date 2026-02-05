package com.bizsync.backend.domain.project.dto.response;

import com.bizsync.backend.domain.project.entity.Project;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProjectListResponseDTO(
        Long projectId,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        BigDecimal totalBudget,
        BigDecimal usedBudget
) {
    /**
     * Project 엔티티에서 DTO로 변환
     */
    public static ProjectListResponseDTO from(Project project) {
        return new ProjectListResponseDTO(
                project.getProjectId(),
                project.getName(),
                project.getDescription(),
                project.getStartDate(),
                project.getEndDate(),
                project.getStatus().name(),
                project.getTotalBudget(),
                project.getUsedBudget()
        );
    }
}
