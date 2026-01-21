package com.bizsync.backend.service;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.ProjectMember;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.repository.ProjectRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.ProjectCreateRequestDTO;
import com.bizsync.backend.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.dto.response.ProjectMemberResponseDTO;
import com.bizsync.backend.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.mapper.ProjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    public Long createProject(Long userId, ProjectCreateRequestDTO dto) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Project project = Project.builder()
                .name(dto.name())
                .description(dto.description())
                .startDate(dto.startDate())
                .endDate(dto.endDate())
                .totalBudget(dto.totalBudget())
                .usedBudget(BigDecimal.ZERO)
                .build();

        Project savedProject = projectRepository.save(project);

        ProjectMember member = ProjectMember.builder()
                .project(savedProject)
                .user(user)
                .role(ProjectMember.Role.PL)
                .build();

        projectMemberRepository.save(member);

        return savedProject.getProjectId();

    }

    /**
     * 칸반 보드 전체 조회 (MyBatis 사용)
     */
    @Transactional(readOnly = true)
    public ProjectBoardDTO getProjectBoard(Long projectId) {

        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(projectId, currentUserId);
        if (!isMember) {
            throw new IllegalArgumentException("해당 프로젝트에 접근 권한이 없습니다.");
        }

        return projectMapper.selectProjectBoard(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<ProjectListResponseDTO> getMyProjects(Long userId) {
        return projectMemberRepository.findAllByUser_UserId(userId).stream()
                .map(pm -> new ProjectListResponseDTO(
                        pm.getProject().getProjectId(),
                        pm.getProject().getName(),
                        pm.getProject().getDescription(),
                        pm.getProject().getStartDate(),
                        pm.getProject().getEndDate(),
                        pm.getProject().getStatus().name() // status 추가
                ))
                .toList();
    }

    @Transactional
    public void inviteMember(Long projectId, String email) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        // 1. 프로젝트 확인
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        // 2. PL 권한 확인
        validateProjectLeader(projectId, currentUserId);

        // 3. 초대할 유저 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자가 존재하지 않습니다."));

        // 4. 이미 멤버인지 확인
        boolean isAlreadyMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(projectId, user.getUserId());
        if (isAlreadyMember) {
            throw new IllegalArgumentException("이미 프로젝트의 멤버입니다.");
        }

        // 5. 멤버 등록 (기본 권한: MEMBER)
        ProjectMember newMember = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(ProjectMember.Role.MEMBER)
                .build();

        projectMemberRepository.save(newMember);
    }

    /**
     * 프로젝트 완료 처리 (PL만 가능)
     */
    @Transactional
    public void completeProject(Long projectId, Long userId) {
        // 1. 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        // 2. PL 권한 확인
        validateProjectLeader(projectId, userId);

        // 3. 프로젝트 완료 처리
        project.complete();
    }

    /**
     * 프로젝트 재진행 처리 (PL만 가능)
     */
    @Transactional
    public void reopenProject(Long projectId, Long userId) {
        // 1. 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        // 2. PL 권한 확인
        validateProjectLeader(projectId, userId);

        // 3. 프로젝트 재진행 처리
        project.reopen();
    }

    /**
     * 프로젝트 멤버 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ProjectMemberResponseDTO> getProjectMembers(Long projectId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        // 프로젝트 멤버인지 확인
        boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(projectId, currentUserId);
        if (!isMember) {
            throw new IllegalArgumentException("해당 프로젝트에 접근 권한이 없습니다.");
        }

        // 프로젝트의 모든 멤버 조회
        return projectMemberRepository.findAllByProject_ProjectId(projectId).stream()
                .map(pm -> new ProjectMemberResponseDTO(
                        pm.getUser().getUserId(),
                        pm.getUser().getName(),
                        pm.getUser().getEmail(),
                        pm.getUser().getDepartment(),
                        pm.getUser().getPosition() != null ? pm.getUser().getPosition().getKorean() : null,
                        pm.getRole().name()
                ))
                .toList();
    }

    /**
     * 프로젝트 리더(PL) 권한 확인 헬퍼 메서드
     */
    private void validateProjectLeader(Long projectId, Long userId) {
        ProjectMember member = projectMemberRepository.findAllByUser_UserId(userId).stream()
                .filter(pm -> pm.getProject().getProjectId().equals(projectId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("해당 프로젝트에 접근 권한이 없습니다."));

        if (member.getRole() != ProjectMember.Role.PL) {
            throw new IllegalArgumentException("프로젝트 리더(PL)만 수행할 수 있는 작업입니다.");
        }
    }

}
