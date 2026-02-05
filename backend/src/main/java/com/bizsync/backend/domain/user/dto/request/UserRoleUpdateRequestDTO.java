package com.bizsync.backend.domain.user.dto.request;

import com.bizsync.backend.domain.user.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequestDTO(
        @NotNull(message = "권한은 필수입니다.")
        Role role
) {
}
