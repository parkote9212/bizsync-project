package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.ColumnCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskMoveRequestDTO;
import com.bizsync.backend.dto.request.TaskUpdateRequestDTO;
import com.bizsync.backend.dto.response.TaskDetailResponseDTO;
import com.bizsync.backend.service.KanbanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanService kanbanService;
    private final SimpMessagingTemplate messagingTemplate;

    // 1. 컬럼 생성
    @PostMapping("/projects/{projectId}/columns")
    public ResponseEntity<Map<String, Object>> createColumn(
            @PathVariable Long projectId,
            @Valid @RequestBody ColumnCreateRequestDTO dto
    ) {
        Long columnId = kanbanService.createColumn(projectId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "컬럼 생성 성공", "columnId", columnId));
    }

    // 2. 업무 생성
    @PostMapping("/columns/{columnId}/tasks")
    public ResponseEntity<Map<String, Object>> createTask(
            @PathVariable Long columnId,
            @Valid @RequestBody TaskCreateRequestDTO dto
    ) {
        Long taskId = kanbanService.createTask(columnId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "업무 생성 성공", "taskId", taskId));
    }

    // 업무상세 조회
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskDetailResponseDTO> getTaskDetail(@PathVariable Long taskId) {
        return ResponseEntity.ok(kanbanService.getTaskDetail(taskId));
    }

    // 업무 수정 (제목, 설명, 마감일, 담당자)
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<String> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequestDTO dto
    ) {
        kanbanService.updateTask(taskId, dto);
        return ResponseEntity.ok("업무가 수정되었습니다.");
    }

    // 업무 삭제
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<String> deleteTask(@PathVariable Long taskId) {
        kanbanService.deleteTask(taskId);
        return ResponseEntity.ok("업무가 삭제되었습니다.");
    }

    @PutMapping("/tasks/{taskId}/move")
    public ResponseEntity<String> moveTask(
            @PathVariable Long taskId,
            @RequestBody TaskMoveRequestDTO dto
    ) {
        kanbanService.moveTask(taskId, dto.targetColumnId(), dto.newSequence());

        Long projectId = kanbanService.getProjectIdByTaskId(taskId);
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATE");

        return ResponseEntity.ok("이동 완료");
    }
}