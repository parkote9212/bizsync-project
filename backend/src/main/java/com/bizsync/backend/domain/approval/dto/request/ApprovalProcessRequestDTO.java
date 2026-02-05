package com.bizsync.backend.domain.approval.dto.request;

import com.bizsync.backend.domain.approval.entity.ApprovalStatus;
import jakarta.validation.constraints.NotNull;

public record ApprovalProcessRequestDTO(
        @NotNull(message = "결재 상태는 필수 입니다.")
        ApprovalStatus status,

        String comment
) {
}
