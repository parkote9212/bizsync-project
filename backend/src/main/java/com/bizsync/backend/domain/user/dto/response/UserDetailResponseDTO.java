package com.bizsync.backend.domain.user.dto.response;

import com.bizsync.backend.domain.user.entity.AccountStatus;
import com.bizsync.backend.domain.user.entity.Role;
import com.bizsync.backend.domain.user.entity.User;

import java.time.LocalDateTime;

public record UserDetailResponseDTO(
        Long userId,
        String email,
        String name,
        String empNo,
        String department,
        Role role,
        String position,
        AccountStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserDetailResponseDTO from(User user) {
        return new UserDetailResponseDTO(
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getEmpNo(),
                user.getDepartment(),
                user.getRole(),
                user.getPosition() != null ? user.getPosition().getKorean() : null,
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
