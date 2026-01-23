package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.ColumnCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskCreateRequestDTO;
import com.bizsync.backend.dto.request.TaskMoveRequestDTO;
import com.bizsync.backend.dto.request.TaskUpdateRequestDTO;
import com.bizsync.backend.dto.response.ApiResponse;
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

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanService kanbanService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ExcelService excelService;

    @PostMapping("/projects/{projectId}/columns")
    public ResponseEntity<ApiResponse<Long>> createColumn(
            @PathVariable Long projectId,
            @Valid @RequestBody ColumnCreateRequestDTO dto
    ) {
        Long columnId = kanbanService.createColumn(projectId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(columnId, "컬럼 생성 성공"));
    }

    @DeleteMapping("/columns/{columnId}")
    public ResponseEntity<ApiResponse<Void>> deleteColumn(@PathVariable Long columnId) {
        kanbanService.deleteColumn(columnId);
        return ResponseEntity.ok(ApiResponse.success("컬럼이 삭제되었습니다."));
    }

    @PostMapping("/columns/{columnId}/tasks")
    public ResponseEntity<ApiResponse<Long>> createTask(
            @PathVariable Long columnId,
            @Valid @RequestBody TaskCreateRequestDTO dto
    ) {
        Long taskId = kanbanService.createTask(columnId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(taskId, "업무 생성 성공"));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskDetailResponseDTO>> getTaskDetail(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success(kanbanService.getTaskDetail(taskId)));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequestDTO dto
    ) {
        kanbanService.updateTask(taskId, dto);
        return ResponseEntity.ok(ApiResponse.success("업무가 수정되었습니다."));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long taskId) {
        kanbanService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("업무가 삭제되었습니다."));
    }

    @PutMapping("/tasks/{taskId}/move")
    public ResponseEntity<ApiResponse<Void>> moveTask(
            @PathVariable Long taskId,
            @RequestBody TaskMoveRequestDTO dto
    ) {
        kanbanService.moveTask(taskId, dto.targetColumnId(), dto.newSequence());

        Long projectId = kanbanService.getProjectIdByTaskId(taskId);
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, "BOARD_UPDATE");

        return ResponseEntity.ok(ApiResponse.success("이동 완료"));
    }

    @PostMapping("/projects/{projectId}/excel")
    public ResponseEntity<ApiResponse<Integer>> uploadTasksExcel(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            int count = excelService.uploadTasksFromExcel(projectId, file);
            return ResponseEntity.ok(ApiResponse.success(count, count + "개의 업무가 등록되었습니다."));
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("엑셀 파일 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

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
