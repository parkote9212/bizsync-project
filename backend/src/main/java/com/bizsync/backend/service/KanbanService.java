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
    public Long createColumn(Long projectId, ColumnCreateRequestDTO dto){
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
    public Long createTask(Long columId, TaskCreateRequestDTO dto){
        KanbanColumn column = kanbanColumnRepository.findById(columId)
                .orElseThrow(() -> new IllegalArgumentException("칼럼이 없습니다."));

        User worker = null;
        if (dto.workerId() != null){
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

}
