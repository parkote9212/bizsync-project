package com.bizsync.backend.service;

import com.bizsync.backend.common.annotation.RequireProjectLeader;
import com.bizsync.backend.common.annotation.RequireProjectMember;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.*;
import com.bizsync.backend.domain.repository.*;
import com.bizsync.backend.dto.request.ProjectCreateRequestDTO;
import com.bizsync.backend.dto.request.ProjectUpdateRequestDTO;
import com.bizsync.backend.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.mapper.ProjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 프로젝트 관련 비즈니스 로직을 처리하는 서비스
 * 
 * <p>프로젝트 생성, 수정, 삭제, 조회 등의 기능을 제공합니다.
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
    private final ProjectMapper projectMapper;
    private final KanbanColumnRepository kanbanColumnRepository;
    private final TaskRepository taskRepository;
    private final ApprovalDocumentRepository approvalDocumentRepository;

    /**
     * 새로운 프로젝트를 생성합니다.
     * 
     * <p>프로젝트 생성자는 자동으로 프로젝트 리더(PL)로 등록됩니다.
     * 
     * @param userId 프로젝트 생성자 ID
     * @param dto 프로젝트 생성 요청 DTO
     * @return 생성된 프로젝트 ID
     */
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
     * <p>프로젝트 멤버만 조회할 수 있으며, 현재 사용자의 역할 정보가 포함됩니다.
     * 
     * @param projectId 프로젝트 ID
     * @return 프로젝트 보드 DTO (프로젝트 정보, 컬럼, 업무 포함)
     */
    @RequireProjectMember
    @Transactional(readOnly = true)
    public ProjectBoardDTO getProjectBoard(Long projectId) {
        ProjectBoardDTO boardDTO = projectMapper.selectProjectBoard(projectId)
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
        return projectMapper.selectMyProjects(userId);
    }

    /**
     * 프로젝트를 완료 상태로 변경합니다.
     * 
     * <p>프로젝트 리더만 완료할 수 있습니다.
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
     * 완료되거나 보류된 프로젝트를 재진행 상태로 변경합니다.
     * 
     * <p>프로젝트 리더만 재진행할 수 있습니다.
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
     * <p>프로젝트 리더만 수정할 수 있습니다.
     * 
     * @param projectId 프로젝트 ID
     * @param dto 프로젝트 수정 요청 DTO
     */
    @RequireProjectLeader
    @Transactional
    public void updateProject(Long projectId, ProjectUpdateRequestDTO dto) {
        Project project = projectRepository.findByIdOrThrow(projectId);
        project.update(dto.name(), dto.description(), dto.startDate(), dto.endDate(), dto.totalBudget());
    }

    /**
     * 프로젝트를 삭제합니다.
     * 
     * <p>프로젝트 리더만 삭제할 수 있으며, 관련된 모든 데이터(업무, 컬럼, 멤버, 결재)도 함께 삭제됩니다.
     * 
     * @param projectId 프로젝트 ID
     */
    @RequireProjectLeader
    @Transactional
    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND);
        }

        taskRepository.deleteByColumn_Project_ProjectId(projectId);

        List<KanbanColumn> columns = kanbanColumnRepository.findByProject_ProjectId(projectId);
        kanbanColumnRepository.deleteAll(columns);

        List<ProjectMember> members = projectMemberRepository.findAllByProject_ProjectId(projectId);
        projectMemberRepository.deleteAll(members);

        List<ApprovalDocument> approvalDocs = approvalDocumentRepository.findByProject_ProjectId(projectId);
        approvalDocumentRepository.deleteAll(approvalDocs);

        projectRepository.deleteById(projectId);
    }


}
