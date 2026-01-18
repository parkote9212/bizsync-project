package com.bizsync.backend.dto.request;

import java.time.LocalDate;

public record TaskUpdateRequestDTO(
        String title,
        String content,
        LocalDate deadline,
        Long workerId // 담당자 변경 시 사용
) {}