package com.bizsync.backend.domain.project.dto.request;

public record TaskMoveRequestDTO(
        Long targetColumnId,
        Integer newSequence
) {
}