package com.bizsync.backend.domain.project.service;

import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.project.dto.request.ProjectCreateRequestDTO;
import com.bizsync.backend.domain.project.dto.request.ProjectUpdateRequestDTO;
import com.bizsync.backend.domain.project.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.domain.project.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.domain.project.entity.ProjectMember;
import com.bizsync.backend.domain.project.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.project.repository.ProjectRepository;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.global.common.annotation.RequireProjectLeader;
import com.bizsync.backend.global.common.annotation.RequireProjectMember;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.exception.ResourceNotFoundException;
import com.bizsync.backend.global.common.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 프로젝트 관련 비즈니스 로직을 처리하는 서비스
 *
 * <p>
 * 프로젝트 생성, 수정, 삭제, 조회 등의 기능을 제공합니다.
 *
 * @author BizSync Team
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    /**
     * 새로운 프로젝트를 생성합니다.
     *
     * <p>
     * 프로젝트 생성자는 자동으로 프로젝트 리더(PL)로 등록됩니다.
     *
     * @param userId 프로젝트 생성자 ID
     * @param dto    프로젝트 생성 요청 DTO
     * @return 생성된 프로젝트 ID
     */
    @CacheEvict(value = "projects", key = "'all'", condition = "#result != null")
    public Long createProject(Long userId, ProjectCreateRequestDTO dto) {

        User user = userRepository.findByIdOrThrow(userId);

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
     * 프로젝트 칸반 보드 정보를 조회합니다.
     *
     * <p>
     * 프로젝트 멤버만 조회할 수 있으며, 현재 사용자의 역할 정보가 포함됩니다.
     *
     * @param projectId 프로젝트 ID
     * @return 프로젝트 보드 DTO (프로젝트 정보, 컬럼, 업무 포함)
     */
    @RequireProjectMember
    @Transactional(readOnly = true)
    public ProjectBoardDTO getProjectBoard(Long projectId) {
        ProjectBoardDTO boardDTO = projectRepository.findProjectBoard(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND));

        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserIdOrThrow(projectId, userId);
        boardDTO.setMyRole(member.getRole().name());

        return boardDTO;
    }

    /**
     * 사용자가 멤버로 참여한 프로젝트 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 프로젝트 목록
     */
    @Transactional(readOnly = true)
    public List<ProjectListResponseDTO> getMyProjects(Long userId) {
        return projectRepository.findMyProjects(userId);
    }

    /**
     * ID로 프로젝트를 조회합니다.
     *
     * @param id 프로젝트 ID
     * @return 프로젝트
     */
    @Cacheable(value = "projects", key = "#id")
    @Transactional(readOnly = true)
    public Project findById(Long id) {
        return projectRepository.findByIdOrThrow(id);
    }

    /**
     * 프로젝트를 완료 상태로 변경합니다.
     *
     * <p>
     * 프로젝트 리더만 완료할 수 있습니다.
     *
     * @param projectId 프로젝트 ID
     */
    @RequireProjectLeader
    @Transactional
    public void completeProject(Long projectId) {
        Project project = projectRepository.findByIdOrThrow(projectId);
        project.complete();
    }

    /**
     * 기획중인 프로젝트를 진행중 상태로 변경합니다.
     *
     * <p>
     * 프로젝트 리더만 시작할 수 있습니다.
     *
     * @param projectId 프로젝트 ID
     */
    @RequireProjectLeader
    @Transactional
    public void startProject(Long projectId) {
        Project project = projectRepository.findByIdOrThrow(projectId);
        project.start();
    }

    /**
     * 완료되거나 보류된 프로젝트를 재진행 상태로 변경합니다.
     *
     * <p>
     * 프로젝트 리더만 재진행할 수 있습니다.
     *
     * @param projectId 프로젝트 ID
     */
    @RequireProjectLeader
    @Transactional
    public void reopenProject(Long projectId) {
        Project project = projectRepository.findByIdOrThrow(projectId);
        project.reopen();
    }

    /**
     * 프로젝트 정보를 수정합니다.
     *
     * <p>
     * 프로젝트 리더만 수정할 수 있습니다.
     *
     * @param projectId 프로젝트 ID
     * @param dto       프로젝트 수정 요청 DTO
     */
    @RequireProjectLeader
    @CacheEvict(value = "projects", key = "#projectId")
    @Transactional
    public void updateProject(Long projectId, ProjectUpdateRequestDTO dto) {
        Project project = projectRepository.findByIdOrThrow(projectId);
        project.update(dto.name(), dto.description(), dto.startDate(), dto.endDate(), dto.totalBudget());
    }

    /**
     * 프로젝트를 삭제합니다 (소프트 삭제).
     *
     * <p>
     * 프로젝트 리더만 삭제할 수 있으며, 프로젝트 상태를 CANCELLED로 변경합니다.
     * 관련 데이터는 유지되며, 통계에 반영됩니다.
     *
     * @param projectId 프로젝트 ID
     */
    @RequireProjectLeader
    @CacheEvict(value = "projects", key = "#projectId")
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findByIdOrThrow(projectId);
        project.cancel();
    }

}
