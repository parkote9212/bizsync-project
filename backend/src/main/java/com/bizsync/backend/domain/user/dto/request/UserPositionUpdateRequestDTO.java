package com.bizsync.backend.domain.user.dto.request;

import com.bizsync.backend.domain.user.entity.Position;

public record UserPositionUpdateRequestDTO(
        Position position
) {
}
