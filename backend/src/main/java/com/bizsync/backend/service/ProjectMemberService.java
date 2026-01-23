package com.bizsync.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

/**
 * 프로젝트 멤버 관리 서비스
 * 프로젝트 멤버 초대, 권한 변경, 삭제, 조회 등의 책임을 담당
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    /**
     * 프로젝트에 멤버 초대 (PL만 가능)
     */
    @RequireProjectLeader
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
     * 멤버 권한 변경 (PL만 가능)
     */
    @RequireProjectLeader
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
     * 멤버 삭제 (PL만 가능)
     */
    @RequireProjectLeader
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
     * 프로젝트 멤버 목록 조회
     */
    @RequireProjectMember
    @Transactional(readOnly = true)
    public List<ProjectMemberResponseDTO> getProjectMembers(Long projectId) {
        return projectMemberRepository.findAllByProject_ProjectId(projectId).stream()
                .map(ProjectMemberResponseDTO::from)
                .toList();
    }
}
