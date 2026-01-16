package com.bizsync.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProjectCreateRequestDTO(

        @NotBlank(message = "프로젝트 명은 필수입니다.") // 빈 문자열, null, 공백 불가
        String name,

        String description, // 이건 null 허용 (선택 입력이니까)

        @NotNull(message = "시작일은 필수입니다.")
        LocalDate startDate,

        @NotNull(message = "종료일은 필수입니다.")
        LocalDate endDate,

        @NotNull(message = "예산은 필수입니다.")
        @PositiveOrZero(message = "예산은 0원 이상이어야 합니다.") // 음수 방지
        BigDecimal totalBudget
) {}