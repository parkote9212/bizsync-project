package com.bizsync.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ApprovalCreateRequestDTO(
        @NotBlank(message = "제목은 필수입니다.")
        String title,

        String content,

        @NotEmpty(message = "최소 1명 이상의 결재자가 필요합니다.")
        List<Long> approverIds // 결재자 ID 리스트
) {
}