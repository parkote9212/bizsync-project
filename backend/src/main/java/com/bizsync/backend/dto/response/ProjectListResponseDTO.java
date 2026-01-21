package com.bizsync.backend.dto.response;

import java.time.LocalDate;

public record ProjectListResponseDTO(
        Long projectId,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        String status
) {
}
