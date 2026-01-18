package com.bizsync.backend.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class KanbanService {

    private final ProjectRepository projectRepository;
    private final KanbanColumnRepository kanbanColumnRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // 칼럼 생성
    public Long createColumn(Long projectId, ColumnCreateRequestDTO dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트가 없습니다."));

        // 자동 순서 계산 : 기존 Max값 + 1
        int nextSequence = kanbanColumnRepository.findMaxSequence(projectId) + 1;

        KanbanColumn column = KanbanColumn.builder()
                .project(project)
                .name(dto.name())
                .sequence(nextSequence)
                .build();

        return kanbanColumnRepository.save(column).getColumnId();
    }

    // 업무 생성
    public Long createTask(Long columId, TaskCreateRequestDTO dto) {
        KanbanColumn column = kanbanColumnRepository.findById(columId)
                .orElseThrow(() -> new IllegalArgumentException("칼럼이 없습니다."));

        User worker = null;
        if (dto.workerId() != null) {
            worker = userRepository.findById(dto.workerId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 담당자입니다."));
        }

        int nextSequence = taskRepository.findMaxSequence(columId) + 1;

        Task task = Task.builder()
                .column(column)
                .title(dto.title())
                .content(dto.content())
                .deadline(dto.deadline())
                .worker(worker)
                .sequence(nextSequence)
                .build();

        return taskRepository.save(task).getTaskId();
    }

    // ... imports

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
                task.getColumn().getName()
        );
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
                dto.deadline() != null ? dto.deadline(): null,
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
        // Todo 다른 카드들의 sequence를 밀어주는 로직필요
    }
}
