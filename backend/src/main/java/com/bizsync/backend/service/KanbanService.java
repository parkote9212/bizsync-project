package com.bizsync.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // 칼럼 생성 (PL만 가능)
    public Long createColumn(Long projectId, ColumnCreateRequestDTO dto) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트가 없습니다."));

        // PL 권한 확인
        validateProjectLeader(projectId, currentUserId);

        // 자동 순서 계산 : 기존 Max값 + 1
        int nextSequence = kanbanColumnRepository.findMaxSequence(projectId) + 1;

        // 컬럼 타입 결정: DTO에서 지정했으면 사용, 아니면 자동 판별
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

    // 칼럼 삭제 (PL만 가능)
    @Transactional
    public void deleteColumn(Long columnId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();

        KanbanColumn column = kanbanColumnRepository.findById(columnId)
                .orElseThrow(() -> new IllegalArgumentException("컬럼을 찾을 수 없습니다."));

        Long projectId = column.getProject().getProjectId();

        // PL 권한 확인
        validateProjectLeader(projectId, currentUserId);

        // 컬럼에 속한 업무들도 함께 삭제됨 (cascade 설정에 따라 다름)
        kanbanColumnRepository.deleteById(columnId);
    }

    /**
     * 컬럼명을 분석하여 ColumnType을 자동으로 결정
     * - "완료", "done", "completed" 등 → DONE
     * - "진행", "doing", "progress" 등 → IN_PROGRESS
     * - 나머지 → TODO
     */
    private ColumnType determineColumnType(String columnName) {
        if (columnName == null) {
            return ColumnType.IN_PROGRESS;
        }

        String lowerName = columnName.toLowerCase().trim();

        // 완료 컬럼 판별
        if (lowerName.contains("완료") || lowerName.contains("done") ||
                lowerName.contains("completed") || lowerName.contains("complete")) {
            return ColumnType.DONE;
        }

        // 진행 중 컬럼 판별
        if (lowerName.contains("진행") || lowerName.contains("doing") ||
                lowerName.contains("progress") || lowerName.contains("in progress")) {
            return ColumnType.IN_PROGRESS;
        }

        // 기본값: TODO (할 일)
        return ColumnType.TODO;
    }

    // 업무 생성
    public Long createTask(Long columId, TaskCreateRequestDTO dto) {
        KanbanColumn column = kanbanColumnRepository.findById(columId)
                .orElseThrow(() -> new IllegalArgumentException("칼럼이 없습니다."));

        Long workerId = dto.workerId();
        if (workerId == null) {
            workerId = SecurityUtil.getCurrentUserIdOrThrow();
        }
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

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

    // 1. 상세 조회
    @Transactional(readOnly = true)
    public TaskDetailResponseDTO getTaskDetail(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 업무입니다."));

        return new TaskDetailResponseDTO(
                task.getTaskId(),
                task.getTitle(),
                task.getContent(),
                task.getDeadline() != null ? task.getDeadline() : null, // LocalDateTime -> LocalDate
                task.getWorker() != null ? task.getWorker().getName() : "미배정",
                task.getWorker() != null ? task.getWorker().getUserId() : null,
                task.getColumn().getName());
    }

    // 2. 수정
    @Transactional
    public void updateTask(Long taskId, TaskUpdateRequestDTO dto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 업무입니다."));

        // 담당자 변경 로직
        User worker = null;
        if (dto.workerId() != null) {
            worker = userRepository.findById(dto.workerId())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        }

        // Dirty Checking으로 업데이트
        task.updateDetails(dto.title(),
                dto.content(),
                dto.deadline() != null ? dto.deadline() : null,
                worker);
    }

    // 3. 삭제
    @Transactional
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    @Transactional
    public void moveTask(Long taskId, Long targetColumnId, Integer newSequence) {
        // 1. 이동할 업무 조회
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("업무를 찾을 수 없습니다."));

        // 2. 이동할 컬럼 조회
        KanbanColumn targetColumn = null;
        if (!task.getColumn().getColumnId().equals(targetColumnId)) {
            targetColumn = kanbanColumnRepository.findById(targetColumnId)
                    .orElseThrow(() -> new IllegalArgumentException("목표 컬럼이 존재하지 않습니다."));
        }

        // 3. 컬럼과 순서 변경을 편의 메서드로 처리
        task.updatePosition(targetColumn, newSequence);
    }

    // 지정된 taskId가 속한 프로젝트 ID를 반환
    @Transactional(readOnly = true)
    public Long getProjectIdByTaskId(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("업무를 찾을 수 없습니다."));

        Long projectId = task.getProjectId();
        if (projectId == null)
            throw new IllegalArgumentException("해당 업무에 연결된 프로젝트가 없습니다.");
        return projectId;
    }

    /**
     * 프로젝트 리더(PL) 권한 확인 헬퍼 메서드
     */
    private void validateProjectLeader(Long projectId, Long userId) {
        com.bizsync.backend.domain.entity.ProjectMember member = projectMemberRepository.findAllByUser_UserId(userId)
                .stream()
                .filter(pm -> pm.getProject().getProjectId().equals(projectId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("해당 프로젝트에 접근 권한이 없습니다."));

        if (member.getRole() != com.bizsync.backend.domain.entity.ProjectMember.Role.PL) {
            throw new IllegalArgumentException("프로젝트 리더(PL)만 수행할 수 있는 작업입니다.");
        }
    }
}
