package com.bizsync.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bizsync.backend.common.annotation.RequireProjectLeader;
import com.bizsync.backend.common.annotation.RequireProjectMember;
import com.bizsync.backend.common.util.SecurityUtil;
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
import com.bizsync.backend.dto.response.ProjectMemberResponseDTO;
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
        @RequireProjectMember
        @Transactional(readOnly = true)
        public ProjectBoardDTO getProjectBoard(Long projectId) {
                // 1. 프로젝트 보드 조회
                ProjectBoardDTO boardDTO = projectMapper.selectProjectBoard(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

                // 2. 현재 사용자의 역할 조회
                Long userId = com.bizsync.backend.common.util.SecurityUtil.getCurrentUserIdOrThrow();
                ProjectMember member = projectMemberRepository.findByProject_ProjectIdAndUser_UserId(projectId, userId)
                                .orElseThrow(() -> new IllegalArgumentException("프로젝트 멤버가 아닙니다."));

                // 3. 역할 설정
                boardDTO.setMyRole(member.getRole().name());

                return boardDTO;
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

        @RequireProjectLeader
        @Transactional
        public void inviteMember(Long projectId, String email) {
                // 1. 프로젝트 확인
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

                // 2. 초대할 유저 확인
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자가 존재하지 않습니다."));

                // 3. 이미 멤버인지 확인
                boolean isAlreadyMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(projectId,
                                user.getUserId());
                if (isAlreadyMember) {
                        throw new IllegalArgumentException("이미 프로젝트의 멤버입니다.");
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
         * 프로젝트 완료 처리 (PL만 가능)
         */
        @RequireProjectLeader
        @Transactional
        public void completeProject(Long projectId) {
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

                project.complete();
        }

        /**
         * 프로젝트 재진행 처리 (PL만 가능)
         */
        @RequireProjectLeader
        @Transactional
        public void reopenProject(Long projectId) {
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

                project.reopen();
        }

        /**
         * 프로젝트 수정 (PL만 가능)
         */
        @RequireProjectLeader
        @Transactional
        public void updateProject(Long projectId, ProjectUpdateRequestDTO dto) {
                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

                project.update(dto.name(), dto.description(), dto.startDate(), dto.endDate(), dto.totalBudget());
        }

        /**
         * 프로젝트 삭제 (PL만 가능)
         */
        @RequireProjectLeader
        @Transactional
        public void deleteProject(Long projectId) {
                // 1. 프로젝트 존재 여부 확인
                if (!projectRepository.existsById(projectId)) {
                        throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다.");
                }

                // 2. 연관된 데이터 삭제 (순서 중요!)
                // 2-1. 프로젝트의 모든 업무(Task) 삭제
                taskRepository.deleteByColumn_Project_ProjectId(projectId);

                // 2-2. 프로젝트의 모든 컬럼 삭제
                List<KanbanColumn> columns = kanbanColumnRepository.findByProject_ProjectId(projectId);
                kanbanColumnRepository.deleteAll(columns);

                // 2-3. 프로젝트 멤버 삭제
                List<ProjectMember> members = projectMemberRepository.findAllByProject_ProjectId(projectId);
                projectMemberRepository.deleteAll(members);

                // 2-4. 프로젝트 관련 결재 문서 삭제
                List<ApprovalDocument> approvalDocs = approvalDocumentRepository.findByProject_ProjectId(projectId);
                approvalDocumentRepository.deleteAll(approvalDocs);

                // 3. 프로젝트 삭제
                projectRepository.deleteById(projectId);
        }

        /**
         * 멤버 권한 변경 (PL만 가능)
         */
        @RequireProjectLeader
        @Transactional
        public void updateMemberRole(Long projectId, Long memberId, String newRole) {
                Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

                // 1. 변경할 멤버 조회
                ProjectMember member = projectMemberRepository.findAllByProject_ProjectId(projectId).stream()
                                .filter(pm -> pm.getUser().getUserId().equals(memberId))
                                .findFirst()
                                .orElseThrow(() -> new IllegalArgumentException("해당 멤버를 찾을 수 없습니다."));

                // 2. 자기 자신의 권한은 변경 불가
                if (memberId.equals(currentUserId)) {
                        throw new IllegalArgumentException("자기 자신의 권한은 변경할 수 없습니다.");
                }

                // 3. 권한 변경
                member.updateRole(ProjectMember.Role.valueOf(newRole));
        }

        /**
         * 멤버 삭제 (PL만 가능)
         */
        @RequireProjectLeader
        @Transactional
        public void removeMember(Long projectId, Long memberId) {
                Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

                // 1. 자기 자신은 삭제 불가
                if (memberId.equals(currentUserId)) {
                        throw new IllegalArgumentException("프로젝트 리더는 스스로를 삭제할 수 없습니다.");
                }

                // 2. 멤버 조회 및 삭제
                ProjectMember member = projectMemberRepository.findAllByProject_ProjectId(projectId).stream()
                                .filter(pm -> pm.getUser().getUserId().equals(memberId))
                                .findFirst()
                                .orElseThrow(() -> new IllegalArgumentException("해당 멤버를 찾을 수 없습니다."));

                projectMemberRepository.delete(member);
        }

        /**
         * 프로젝트 멤버 목록 조회
         */
        @RequireProjectMember
        @Transactional(readOnly = true)
        public List<ProjectMemberResponseDTO> getProjectMembers(Long projectId) {
                return projectMemberRepository.findAllByProject_ProjectId(projectId).stream()
                                .map(pm -> new ProjectMemberResponseDTO(
                                                pm.getUser().getUserId(),
                                                pm.getUser().getName(),
                                                pm.getUser().getEmail(),
                                                pm.getUser().getDepartment(),
                                                pm.getUser().getPosition() != null
                                                                ? pm.getUser().getPosition().getKorean()
                                                                : null,
                                                pm.getRole().name()))
                                .toList();
        }

}
