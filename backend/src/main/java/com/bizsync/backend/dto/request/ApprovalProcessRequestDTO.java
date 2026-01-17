package com.bizsync.backend.dto.request;

import com.bizsync.backend.domain.entity.ApprovalStatus;
import jakarta.validation.constraints.NotNull;

public record ApprovalProcessRequestDTO(
        @NotNull(message = "결재 상태는 필수 입니다.")
        ApprovalStatus status,

        String comment
) {
}
