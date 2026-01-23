package com.bizsync.backend.service;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.ProjectMember;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 프로젝트 권한 검증 서비스
 * Spring Security의 @PreAuthorize에서 사용
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectSecurityService {

    private final ProjectMemberRepository projectMemberRepository;

    /**
     * 현재 사용자가 프로젝트의 리더(PL)인지 확인
     *
     * @param projectId 프로젝트 ID
     * @return PL이면 true, 아니면 false
     */
    public boolean isProjectLeader(Long projectId) {
        try {
            Long userId = SecurityUtil.getCurrentUserIdOrThrow();

            ProjectMember member = projectMemberRepository.findByProjectAndUser(projectId, userId)
                    .orElse(null);

            if (member == null) {
                log.warn("프로젝트 멤버가 아닙니다. projectId={}, userId={}", projectId, userId);
                return false;
            }

            boolean isLeader = member.getRole() == ProjectMember.Role.PL;
            if (!isLeader) {
                log.warn("프로젝트 리더 권한이 없습니다. projectId={}, userId={}, role={}", projectId, userId,
                        member.getRole());
            }

            return isLeader;
        } catch (Exception e) {
            log.error("권한 확인 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 현재 사용자가 프로젝트 멤버인지 확인
     *
     * @param projectId 프로젝트 ID
     * @return 멤버이면 true, 아니면 false
     */
    public boolean isProjectMember(Long projectId) {
        try {
            Long userId = SecurityUtil.getCurrentUserIdOrThrow();

            boolean isMember = projectMemberRepository.existsByProjectAndUser(projectId, userId);
            if (!isMember) {
                log.warn("프로젝트 멤버가 아닙니다. projectId={}, userId={}", projectId, userId);
            }

            return isMember;
        } catch (Exception e) {
            log.error("권한 확인 중 오류 발생", e);
            return false;
        }
    }
}
