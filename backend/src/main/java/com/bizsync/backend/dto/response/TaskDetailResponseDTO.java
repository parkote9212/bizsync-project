package com.bizsync.backend.dto.response;

import java.time.LocalDate;

public record TaskDetailResponseDTO(
        Long taskId,
        String title,
        String content,
        LocalDate deadline,
        String workerName,
        Long workerId,
        String columnName
) {}