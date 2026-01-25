package com.bizsync.backend.dto.request;

import com.bizsync.backend.domain.entity.Position;

public record UserPositionUpdateRequestDTO(
        Position position
) {
}
