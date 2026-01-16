package com.bizsync.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ColumnCreateRequestDTO(
        @NotBlank(message = "컬럼명은 필수입니다.")
        String name
) {}