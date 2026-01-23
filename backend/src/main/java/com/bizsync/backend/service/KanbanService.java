package com.bizsync.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bizsync.backend.common.annotation.RequireProjectLeader;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ForbiddenException;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.ColumnType;
import com.bizsync.backend.domain.entity.KanbanColumn;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.Task;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.KanbanColumnRepository;
import com.bizsync.backend.domain.repository.ProjectRepository;
import com.bizsync.backend.domain.repository.TaskRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.ColumnCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskUpdateRequestDTO;
import com.bizsync.backend.dto.response.TaskDetailResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class KanbanService {

    private final ProjectRepository projectRepository;
    private final KanbanColumnRepository kanbanColumnRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final com.bizsync.backend.domain.repository.ProjectMemberRepository projectMemberRepository;

    @RequireProjectLeader
    public Long createColumn(Long projectId, ColumnCreateRequestDTO dto) {
        Project project = projectRepository.findByIdOrThrow(projectId);
        int nextSequence = kanbanColumnRepository.findMaxSequence(projectId) + 1;

        ColumnType columnType = dto.columnType() != null
                ? dto.columnType()
                : determineColumnType(dto.name());

        KanbanColumn column = KanbanColumn.builder()
                .project(project)
                .name(dto.name())
                .description(dto.description())
                .sequence(nextSequence)
                .columnType(columnType)
                .build();

        return kanbanColumnRepository.save(column).getColumnId();
    }

    @Transactional
    public void deleteColumn(Long columnId) {
        KanbanColumn column = kanbanColumnRepository.findByIdOrThrow(columnId);
        Long projectId = column.getProject().getProjectId();

        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
        if (!isProjectLeader(projectId, currentUserId)) {
            throw new ForbiddenException(ErrorCode.PROJECT_LEADER_ONLY);
        }

        kanbanColumnRepository.deleteById(columnId);
    }

    private ColumnType determineColumnType(String columnName) {
        if (columnName == null) {
            return ColumnType.IN_PROGRESS;
        }

        String lowerName = columnName.toLowerCase().trim();

        if (lowerName.contains("완료") || lowerName.contains("done") ||
                lowerName.contains("completed") || lowerName.contains("complete")) {
            return ColumnType.DONE;
        }

        if (lowerName.contains("진행") || lowerName.contains("doing") ||
                lowerName.contains("progress") || lowerName.contains("in progress")) {
            return ColumnType.IN_PROGRESS;
        }

        return ColumnType.TODO;
    }

    public Long createTask(Long columId, TaskCreateRequestDTO dto) {
        KanbanColumn column = kanbanColumnRepository.findByIdOrThrow(columId);

        Long workerId = dto.workerId();
        if (workerId == null) {
            workerId = SecurityUtil.getCurrentUserIdOrThrow();
        }
        User worker = userRepository.findByIdOrThrow(workerId);

        int nextSequence = taskRepository.findMaxSequence(columId) + 1;

        Task task = Task.builder()
                .title(dto.title())
                .content(dto.content())
                .column(column)
                .worker(worker)
                .deadline(dto.deadline())
                .sequence(nextSequence)
                .build();

        return taskRepository.save(task).getTaskId();
    }

    @Transactional(readOnly = true)
    public TaskDetailResponseDTO getTaskDetail(Long taskId) {
        Task task = taskRepository.findByIdOrThrow(taskId);
        return TaskDetailResponseDTO.from(task);
    }

    @Transactional
    public void updateTask(Long taskId, TaskUpdateRequestDTO dto) {
        Task task = taskRepository.findByIdOrThrow(taskId);

        User worker = null;
        if (dto.workerId() != null) {
            worker = userRepository.findByIdOrThrow(dto.workerId());
        }

        task.updateDetails(dto.title(),
                dto.content(),
                dto.deadline() != null ? dto.deadline() : null,
                worker);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    @Transactional
    public void moveTask(Long taskId, Long targetColumnId, Integer newSequence) {
        Task task = taskRepository.findByIdOrThrow(taskId);

        KanbanColumn targetColumn = null;
        if (!task.getColumn().getColumnId().equals(targetColumnId)) {
            targetColumn = kanbanColumnRepository.findByIdOrThrow(targetColumnId);
        }

        task.updatePosition(targetColumn, newSequence);
    }

    @Transactional(readOnly = true)
    public Long getProjectIdByTaskId(Long taskId) {
        Task task = taskRepository.findByIdOrThrow(taskId);
        Long projectId = task.getProjectId();
        if (projectId == null)
            throw new com.bizsync.backend.common.exception.BusinessException(ErrorCode.PROJECT_NOT_LINKED);
        return projectId;
    }

    private boolean isProjectLeader(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectAndUser(projectId, userId)
                .map(member -> member.getRole() == com.bizsync.backend.domain.entity.ProjectMember.Role.PL)
                .orElse(false);
    }
}
