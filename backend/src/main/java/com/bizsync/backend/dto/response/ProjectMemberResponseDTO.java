package com.bizsync.backend.dto.response;

public record ProjectMemberResponseDTO(
        Long userId,
        String name,
        String email,
        String department,
        String position,
        String role // PL or MEMBER
) {
}
