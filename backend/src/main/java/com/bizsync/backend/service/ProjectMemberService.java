package com.bizsync.backend.service;

import com.bizsync.backend.common.annotation.RequireProjectLeader;
import com.bizsync.backend.common.annotation.RequireProjectMember;
import com.bizsync.backend.common.exception.BusinessException;
import com.bizsync.backend.common.exception.DuplicateException;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.ProjectMember;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.repository.ProjectRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.response.ProjectMemberResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 프로젝트 멤버 관리 비즈니스 로직을 처리하는 서비스
 *
 * <p>프로젝트 멤버 초대, 권한 변경, 삭제, 조회 등의 기능을 제공합니다.
 *
 * @author BizSync Team
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    /**
     * 프로젝트에 멤버를 초대합니다.
     *
     * <p>프로젝트 멤버는 누구나 초대할 수 있으며, 이미 멤버인 경우 예외가 발생합니다.
     *
     * @param projectId 프로젝트 ID
     * @param email     초대할 사용자 이메일
     * @throws DuplicateException 이미 프로젝트 멤버인 경우
     */
    @RequireProjectMember
    @CacheEvict(value = "projectMembers", key = "#projectId")
    public void inviteMember(Long projectId, String email) {
        // 1. 프로젝트 확인
        Project project = projectRepository.findByIdOrThrow(projectId);

        // 2. 초대할 유저 확인
        User user = userRepository.findByEmailOrThrow(email);

        // 3. 이미 멤버인지 확인
        boolean isAlreadyMember = projectMemberRepository.existsByProjectAndUser(
                projectId, user.getUserId());
        if (isAlreadyMember) {
            throw new DuplicateException(ErrorCode.PROJECT_ALREADY_MEMBER);
        }

        // 4. 멤버 등록 (기본 권한: MEMBER)
        ProjectMember newMember = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(ProjectMember.Role.MEMBER)
                .build();

        projectMemberRepository.save(newMember);
    }

    /**
     * 프로젝트 멤버의 권한을 변경합니다.
     *
     * <p>프로젝트 리더만 변경할 수 있으며, 자기 자신의 권한은 변경할 수 없습니다.
     *
     * @param projectId 프로젝트 ID
     * @param memberId  변경할 멤버 ID
     * @param newRole   새로운 권한 (PL, MEMBER 등)
     * @throws BusinessException 자기 자신의 권한을 변경하려는 경우
     */
    @RequireProjectLeader
    @CacheEvict(value = "projectMembers", key = "#projectId")
    public void updateMemberRole(Long projectId, Long memberId, String newRole) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        // 1. 변경할 멤버 조회
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserIdOrThrow(projectId, memberId);

        // 2. 자기 자신의 권한은 변경 불가
        if (memberId.equals(currentUserId)) {
            throw new BusinessException(ErrorCode.PROJECT_LEADER_CANNOT_CHANGE_SELF);
        }

        // 3. 권한 변경
        member.updateRole(ProjectMember.Role.valueOf(newRole));
    }

    /**
     * 프로젝트에서 멤버를 제거합니다.
     *
     * <p>프로젝트 리더만 제거할 수 있으며, 자기 자신은 제거할 수 없습니다.
     *
     * @param projectId 프로젝트 ID
     * @param memberId  제거할 멤버 ID
     * @throws BusinessException 자기 자신을 제거하려는 경우
     */
    @RequireProjectLeader
    @CacheEvict(value = "projectMembers", key = "#projectId")
    public void removeMember(Long projectId, Long memberId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        // 1. 자기 자신은 삭제 불가
        if (memberId.equals(currentUserId)) {
            throw new BusinessException(ErrorCode.PROJECT_LEADER_CANNOT_REMOVE_SELF);
        }

        // 2. 멤버 조회 및 삭제
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserIdOrThrow(projectId, memberId);

        projectMemberRepository.delete(member);
    }

    /**
     * 프로젝트 멤버 목록을 조회합니다.
     *
     * <p>프로젝트 멤버만 조회할 수 있습니다.
     *
     * @param projectId 프로젝트 ID
     * @return 프로젝트 멤버 목록
     */
    @RequireProjectMember
    @Cacheable(value = "projectMembers", key = "#projectId")
    @Transactional(readOnly = true)
    public List<ProjectMemberResponseDTO> getProjectMembers(Long projectId) {
        return projectMemberRepository.findAllByProject_ProjectId(projectId).stream()
                .map(ProjectMemberResponseDTO::from)
                .toList();
    }
}
