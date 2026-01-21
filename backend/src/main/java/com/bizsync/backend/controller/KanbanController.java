package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.ColumnCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskMoveRequestDTO;
import com.bizsync.backend.dto.request.TaskUpdateRequestDTO;
import com.bizsync.backend.dto.response.TaskDetailResponseDTO;
import com.bizsync.backend.service.ExcelService;
import com.bizsync.backend.service.KanbanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanService kanbanService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ExcelService excelService;

    // 1. 컬럼 생성 (PL만)
    @PostMapping("/projects/{projectId}/columns")
    public ResponseEntity<Map<String, Object>> createColumn(
            @PathVariable Long projectId,
            @Valid @RequestBody ColumnCreateRequestDTO dto
    ) {
        Long columnId = kanbanService.createColumn(projectId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "컬럼 생성 성공", "columnId", columnId));
    }

    // 컬럼 삭제 (PL만)
    @DeleteMapping("/columns/{columnId}")
    public ResponseEntity<String> deleteColumn(@PathVariable Long columnId) {
        kanbanService.deleteColumn(columnId);
        return ResponseEntity.ok("컬럼이 삭제되었습니다.");
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

    /**
     * 엑셀 대량 업무 등록
     * POST /api/projects/{projectId}/excel
     */
    @PostMapping("/projects/{projectId}/excel")
    public ResponseEntity<Map<String, Object>> uploadTasksExcel(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            int count = excelService.uploadTasksFromExcel(projectId, file);
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "data", Map.of("count", count),
                    "message", count + "개의 업무가 등록되었습니다."
            ));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "ERROR",
                    "message", "엑셀 파일 처리 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 엑셀 다운로드
     * GET /api/projects/{projectId}/excel
     */
    @GetMapping("/projects/{projectId}/excel")
    public ResponseEntity<byte[]> downloadTasksExcel(@PathVariable Long projectId) {
        try {
            byte[] excelData = excelService.downloadTasksAsExcel(projectId);

            String filename = "tasks_" + projectId + ".xlsx";
            String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFilename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excelData);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
