package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.ColumnCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskCreateRequestDTO;
import com.bizsync.backend.service.KanbanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanService kanbanService;

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
}