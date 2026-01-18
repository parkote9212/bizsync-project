package com.bizsync.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record TaskCreateRequestDTO(
        @NotBlank(message = "업무 제목은 필수입니다.")
        String title,

        String content,
        LocalDate deadline,
        Long workerId // 담당자 지정 (선택)
) {
}