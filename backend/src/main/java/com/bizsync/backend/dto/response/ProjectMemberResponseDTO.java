package com.bizsync.backend.dto.response;

import com.bizsync.backend.domain.entity.ProjectMember;

public record ProjectMemberResponseDTO(
        Long userId,
        String name,
        String email,
        String department,
        String position,
        String role // PL or MEMBER
) {
    /**
     * ProjectMember 엔티티에서 DTO로 변환
     */
    public static ProjectMemberResponseDTO from(ProjectMember projectMember) {
        return new ProjectMemberResponseDTO(
                projectMember.getUser().getUserId(),
                projectMember.getUser().getName(),
                projectMember.getUser().getEmail(),
                projectMember.getUser().getDepartment(),
                projectMember.getUser().getPosition() != null
                        ? projectMember.getUser().getPosition().getKorean()
                        : null,
                projectMember.getRole().name()
        );
    }
}
