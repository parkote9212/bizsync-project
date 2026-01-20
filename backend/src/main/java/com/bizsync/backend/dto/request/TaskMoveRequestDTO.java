package com.bizsync.backend.dto.request;

public record TaskMoveRequestDTO(
        Long targetColumnId,
        Integer newSequence
) {
}