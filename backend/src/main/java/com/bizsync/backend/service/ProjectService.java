package com.bizsync.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bizsync.backend.common.annotation.RequireProjectLeader;
import com.bizsync.backend.common.annotation.RequireProjectMember;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.domain.entity.KanbanColumn;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.ProjectMember;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.ApprovalDocumentRepository;
import com.bizsync.backend.domain.repository.KanbanColumnRepository;
import com.bizsync.backend.domain.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.repository.ProjectRepository;
import com.bizsync.backend.domain.repository.TaskRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.ProjectCreateRequestDTO;
import com.bizsync.backend.dto.request.ProjectUpdateRequestDTO;
import com.bizsync.backend.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.mapper.ProjectMapper;

import lombok.RequiredArgsConstructor;

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

        @RequireProjectMember
        @Transactional(readOnly = true)
        public ProjectBoardDTO getProjectBoard(Long projectId) {
                ProjectBoardDTO boardDTO = projectMapper.selectProjectBoard(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND));

                Long userId = com.bizsync.backend.common.util.SecurityUtil.getCurrentUserIdOrThrow();
                ProjectMember member = projectMemberRepository.findByProjectIdAndUserIdOrThrow(projectId, userId);
                boardDTO.setMyRole(member.getRole().name());

                return boardDTO;
        }

        @Transactional(readOnly = true)
        public List<ProjectListResponseDTO> getMyProjects(Long userId) {
                return projectMapper.selectMyProjects(userId);
        }

        @RequireProjectLeader
        @Transactional
        public void completeProject(Long projectId) {
                Project project = projectRepository.findByIdOrThrow(projectId);
                project.complete();
        }

        @RequireProjectLeader
        @Transactional
        public void reopenProject(Long projectId) {
                Project project = projectRepository.findByIdOrThrow(projectId);
                project.reopen();
        }

        @RequireProjectLeader
        @Transactional
        public void updateProject(Long projectId, ProjectUpdateRequestDTO dto) {
                Project project = projectRepository.findByIdOrThrow(projectId);
                project.update(dto.name(), dto.description(), dto.startDate(), dto.endDate(), dto.totalBudget());
        }

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
