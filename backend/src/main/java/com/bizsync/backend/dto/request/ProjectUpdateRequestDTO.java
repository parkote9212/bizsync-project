package com.bizsync.backend.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record ProjectUpdateRequestDTO(
        @NotBlank(message = "프로젝트 이름은 필수입니다.")
        String name,

        String description,

        LocalDate startDate,

        LocalDate endDate,

        BigDecimal totalBudget
) {
}
