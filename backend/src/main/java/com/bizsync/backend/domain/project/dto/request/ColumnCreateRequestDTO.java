package com.bizsync.backend.domain.project.dto.request;

import com.bizsync.backend.domain.project.entity.ColumnType;
import jakarta.validation.constraints.NotBlank;

public record ColumnCreateRequestDTO(
        @NotBlank(message = "컬럼명은 필수입니다.") String name,

        String description, // 컬럼 설명 (선택)

        ColumnType columnType // 컬럼 타입 (선택, null이면 자동 판별)
) {
}
