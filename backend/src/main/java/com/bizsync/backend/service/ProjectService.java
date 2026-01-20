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
                        pm.getProject().getEndDate()
                ))
                .toList();
    }

    @Transactional
    public void inviteMember(Long projectId, String email) {
        // 1. 프로젝트 확인
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        // 2. 초대할 유저 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자가 존재하지 않습니다."));

        // 3. 이미 멤버인지 확인
        boolean isAlreadyMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(projectId, user.getUserId());
        if (isAlreadyMember) {
            throw new IllegalArgumentException("이미 프로젝트의 멤버입니다.");
        }

        // 4. 멤버 등록 (기본 권한: MEMBER)
        ProjectMember newMember = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(ProjectMember.Role.MEMBER) // Entity에 Role Enum이 있다고 가정
                .build();

        projectMemberRepository.save(newMember);
    }


}
