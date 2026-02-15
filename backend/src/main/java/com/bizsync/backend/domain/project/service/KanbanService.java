package com.bizsync.backend.domain.project.service;

import com.bizsync.backend.domain.project.dto.request.ColumnCreateRequestDTO;
import com.bizsync.backend.domain.project.dto.request.TaskCreateRequestDTO;
import com.bizsync.backend.domain.project.dto.request.TaskUpdateRequestDTO;
import com.bizsync.backend.domain.project.dto.response.TaskDetailResponseDTO;
import com.bizsync.backend.domain.project.entity.ColumnType;
import com.bizsync.backend.domain.project.entity.KanbanColumn;
import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.project.entity.ProjectMember;
import com.bizsync.backend.domain.project.entity.Task;
import com.bizsync.backend.domain.project.repository.KanbanColumnRepository;
import com.bizsync.backend.domain.project.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.project.repository.ProjectRepository;
import com.bizsync.backend.domain.project.repository.TaskRepository;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.global.common.annotation.RequireProjectLeader;
import com.bizsync.backend.global.common.exception.BusinessException;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.exception.ForbiddenException;
import com.bizsync.backend.global.common.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 칸반 보드 관련 비즈니스 로직을 처리하는 서비스
 *
 * <p>칸반 컬럼 생성/삭제, 업무 생성/수정/삭제/이동 등의 기능을 제공합니다.
 *
 * @author BizSync Team
 */
@Service
@RequiredArgsConstructor
@Transactional
public class KanbanService {

    private final ProjectRepository projectRepository;
    private final KanbanColumnRepository kanbanColumnRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final com.bizsync.backend.global.event.EventProducer eventProducer;

    /**
     * 칸반 컬럼을 생성합니다.
     *
     * <p>프로젝트 리더만 생성할 수 있으며, 컬럼 타입은 이름으로 자동 판단됩니다.
     *
     * @param projectId 프로젝트 ID
     * @param dto       컬럼 생성 요청 DTO
     * @return 생성된 컬럼 ID
     */
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

    /**
     * 칸반 컬럼을 삭제합니다.
     *
     * <p>프로젝트 리더만 삭제할 수 있습니다.
     *
     * @param columnId 삭제할 컬럼 ID
     * @throws ForbiddenException 프로젝트 리더가 아닌 경우
     */
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

    /**
     * 업무를 생성합니다.
     *
     * <p>담당자(workerId)가 지정되지 않으면 현재 사용자가 담당자로 설정됩니다.
     * 담당자는 반드시 프로젝트 멤버여야 합니다.
     *
     * @param columId 컬럼 ID
     * @param dto     업무 생성 요청 DTO
     * @return 생성된 업무 ID
     * @throws BusinessException 담당자가 프로젝트 멤버가 아닌 경우
     */
    public Long createTask(Long columId, TaskCreateRequestDTO dto) {
        KanbanColumn column = kanbanColumnRepository.findByIdOrThrow(columId);
        Long projectId = column.getProject().getProjectId();

        Long workerId = dto.workerId();
        if (workerId == null) {
            workerId = SecurityUtil.getCurrentUserIdOrThrow();
        }
        User worker = userRepository.findByIdOrThrow(workerId);

        // 담당자가 프로젝트 멤버인지 검증
        if (!projectMemberRepository.existsByProjectAndUser(projectId, workerId)) {
            throw new BusinessException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
        }

        int nextSequence = taskRepository.findMaxSequence(columId) + 1;

        Task task = Task.builder()
                .title(dto.title())
                .content(dto.content())
                .column(column)
                .worker(worker)
                .deadline(dto.deadline())
                .sequence(nextSequence)
                .build();

        Task savedTask = taskRepository.save(task);

        // 이벤트 발행
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        // 활동 로그
        com.bizsync.backend.global.event.ActivityLogEvent activityLogEvent =
                com.bizsync.backend.global.event.ActivityLogEvent.create(
                        currentUserId,
                        projectId,
                        com.bizsync.backend.global.event.EventType.TASK_CREATED,
                        String.format("새 업무 '%s'를 생성했습니다", task.getTitle()),
                        "TASK",
                        savedTask.getTaskId(),
                        task.getTitle()
                );
        eventProducer.publishActivityLogEvent(activityLogEvent);

        // 담당자에게 알림 (본인이 아닌 경우)
        if (!workerId.equals(currentUserId)) {
            com.bizsync.backend.global.event.NotificationEvent notificationEvent =
                    com.bizsync.backend.global.event.NotificationEvent.create(
                            currentUserId,
                            workerId,
                            com.bizsync.backend.global.event.EventType.TASK_ASSIGNED,
                            "업무 할당",
                            String.format("'%s' 업무가 할당되었습니다", task.getTitle()),
                            "TASK",
                            savedTask.getTaskId(),
                            "/projects/" + projectId
                    );
            eventProducer.publishNotificationEvent(notificationEvent);
        }

        return savedTask.getTaskId();
    }

    /**
     * 업무 상세 정보를 조회합니다.
     *
     * @param taskId 업무 ID
     * @return 업무 상세 정보 DTO
     */
    @Transactional(readOnly = true)
    public TaskDetailResponseDTO getTaskDetail(Long taskId) {
        Task task = taskRepository.findByIdOrThrow(taskId);
        return TaskDetailResponseDTO.from(task);
    }

    /**
     * 업무 정보를 수정합니다.
     *
     * <p>담당자 변경 시 담당자는 반드시 프로젝트 멤버여야 합니다.
     *
     * @param taskId 업무 ID
     * @param dto    업무 수정 요청 DTO
     * @throws BusinessException 담당자가 프로젝트 멤버가 아닌 경우
     */
    @Transactional
    public void updateTask(Long taskId, TaskUpdateRequestDTO dto) {
        Task task = taskRepository.findByIdOrThrow(taskId);
        Long projectId = task.getProjectId();
        if (projectId == null) {
            throw new BusinessException(ErrorCode.PROJECT_NOT_LINKED);
        }

        User previousWorker = task.getWorker();
        User worker = null;
        if (dto.workerId() != null) {
            worker = userRepository.findByIdOrThrow(dto.workerId());
            // 담당자가 프로젝트 멤버인지 검증
            if (!projectMemberRepository.existsByProjectAndUser(projectId, dto.workerId())) {
                throw new BusinessException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
            }
        }

        task.updateDetails(dto.title(),
                dto.content(),
                dto.deadline() != null ? dto.deadline() : null,
                worker);

        // 이벤트 발행
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        // 활동 로그
        com.bizsync.backend.global.event.ActivityLogEvent activityLogEvent =
                com.bizsync.backend.global.event.ActivityLogEvent.create(
                        currentUserId,
                        projectId,
                        com.bizsync.backend.global.event.EventType.TASK_UPDATED,
                        String.format("업무 '%s'를 수정했습니다", task.getTitle()),
                        "TASK",
                        taskId,
                        task.getTitle()
                );
        eventProducer.publishActivityLogEvent(activityLogEvent);

        // 담당자 변경 시 알림 (새 담당자에게)
        if (worker != null && !worker.getUserId().equals(previousWorker.getUserId())) {
            if (!worker.getUserId().equals(currentUserId)) {
                com.bizsync.backend.global.event.NotificationEvent notificationEvent =
                        com.bizsync.backend.global.event.NotificationEvent.create(
                                currentUserId,
                                worker.getUserId(),
                                com.bizsync.backend.global.event.EventType.TASK_ASSIGNED,
                                "업무 재할당",
                                String.format("'%s' 업무가 재할당되었습니다", task.getTitle()),
                                "TASK",
                                taskId,
                                "/projects/" + projectId
                        );
                eventProducer.publishNotificationEvent(notificationEvent);
            }
        }
    }

    /**
     * 업무를 삭제합니다.
     *
     * @param taskId 삭제할 업무 ID
     */
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findByIdOrThrow(taskId);
        Long projectId = task.getProjectId();
        String taskTitle = task.getTitle();

        taskRepository.deleteById(taskId);

        // 활동 로그 이벤트 발행
        if (projectId != null) {
            Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
            com.bizsync.backend.global.event.ActivityLogEvent activityLogEvent =
                    com.bizsync.backend.global.event.ActivityLogEvent.create(
                            currentUserId,
                            projectId,
                            com.bizsync.backend.global.event.EventType.TASK_DELETED,
                            String.format("업무 '%s'를 삭제했습니다", taskTitle),
                            "TASK",
                            taskId,
                            taskTitle
                    );
            eventProducer.publishActivityLogEvent(activityLogEvent);
        }
    }

    /**
     * 업무를 다른 컬럼으로 이동하거나 순서를 변경합니다.
     *
     * @param taskId         이동할 업무 ID
     * @param targetColumnId 대상 컬럼 ID (null이면 현재 컬럼 유지)
     * @param newSequence    새로운 순서 (null이면 순서 변경 없음)
     */
    @Transactional
    public void moveTask(Long taskId, Long targetColumnId, Integer newSequence) {
        Task task = taskRepository.findByIdOrThrow(taskId);

        KanbanColumn targetColumn = null;
        if (!task.getColumn().getColumnId().equals(targetColumnId)) {
            targetColumn = kanbanColumnRepository.findByIdOrThrow(targetColumnId);
        }

        task.updatePosition(targetColumn, newSequence);
    }

    /**
     * 업무 ID로 프로젝트 ID를 조회합니다.
     *
     * @param taskId 업무 ID
     * @return 프로젝트 ID
     * @throws BusinessException 프로젝트에 연결되지 않은 업무인 경우
     */
    @Transactional(readOnly = true)
    public Long getProjectIdByTaskId(Long taskId) {
        Task task = taskRepository.findByIdOrThrow(taskId);
        Long projectId = task.getProjectId();
        if (projectId == null)
            throw new BusinessException(ErrorCode.PROJECT_NOT_LINKED);
        return projectId;
    }

    private boolean isProjectLeader(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectAndUser(projectId, userId)
                .map(member -> member.getRole() == ProjectMember.Role.PL)
                .orElse(false);
    }
}
