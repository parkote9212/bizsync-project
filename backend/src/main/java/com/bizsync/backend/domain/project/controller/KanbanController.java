package com.bizsync.backend.domain.project.controller;

import com.bizsync.backend.domain.project.dto.request.ColumnCreateRequestDTO;
import com.bizsync.backend.domain.project.dto.request.TaskCreateRequestDTO;
import com.bizsync.backend.domain.project.dto.request.TaskMoveRequestDTO;
import com.bizsync.backend.domain.project.dto.request.TaskUpdateRequestDTO;
import com.bizsync.backend.domain.project.dto.response.TaskDetailResponseDTO;
import com.bizsync.backend.domain.project.service.ExcelService;
import com.bizsync.backend.domain.project.service.KanbanService;
import com.bizsync.backend.global.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * 칸반 보드 관련 REST API 컨트롤러
 *
 * <p>칸반 컬럼 생성/삭제, 업무 생성/수정/삭제/이동, 엑셀 업로드/다운로드 등의 API를 제공합니다.
 *
 * @author BizSync Team
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanService kanbanService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ExcelService excelService;

    /**
     * 칸반 컬럼을 생성합니다.
     *
     * @param projectId 프로젝트 ID
     * @param dto       컬럼 생성 요청 DTO
     * @return 생성된 컬럼 ID
     */
    @PostMapping("/projects/{projectId}/columns")
    public ResponseEntity<ApiResponse<Long>> createColumn(
            @PathVariable Long projectId,
            @Valid @RequestBody ColumnCreateRequestDTO dto
    ) {
        Long columnId = kanbanService.createColumn(projectId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(columnId, "컬럼 생성 성공"));
    }

    /**
     * 칸반 컬럼을 삭제합니다.
     *
     * @param columnId 삭제할 컬럼 ID
     * @return 성공 응답
     */
    @DeleteMapping("/columns/{columnId}")
    public ResponseEntity<ApiResponse<Void>> deleteColumn(@PathVariable Long columnId) {
        kanbanService.deleteColumn(columnId);
        return ResponseEntity.ok(ApiResponse.success("컬럼이 삭제되었습니다."));
    }

    /**
     * 업무를 생성합니다.
     *
     * @param columnId 컬럼 ID
     * @param dto      업무 생성 요청 DTO
     * @return 생성된 업무 ID
     */
    @PostMapping("/columns/{columnId}/tasks")
    public ResponseEntity<ApiResponse<Long>> createTask(
            @PathVariable Long columnId,
            @Valid @RequestBody TaskCreateRequestDTO dto
    ) {
        Long taskId = kanbanService.createTask(columnId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(taskId, "업무 생성 성공"));
    }

    /**
     * 업무 상세 정보를 조회합니다.
     *
     * @param taskId 업무 ID
     * @return 업무 상세 정보
     */
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskDetailResponseDTO>> getTaskDetail(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success(kanbanService.getTaskDetail(taskId)));
    }

    /**
     * 업무 정보를 수정합니다.
     *
     * @param taskId 업무 ID
     * @param dto    업무 수정 요청 DTO
     * @return 성공 응답
     */
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequestDTO dto
    ) {
        kanbanService.updateTask(taskId, dto);
        return ResponseEntity.ok(ApiResponse.success("업무가 수정되었습니다."));
    }

    /**
     * 업무를 삭제합니다.
     *
     * @param taskId 삭제할 업무 ID
     * @return 성공 응답
     */
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long taskId) {
        kanbanService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("업무가 삭제되었습니다."));
    }

    /**
     * 업무를 다른 컬럼으로 이동하거나 순서를 변경합니다.
     *
     * <p>이동 완료 후 WebSocket을 통해 보드 업데이트 알림을 전송합니다.
     *
     * @param taskId 이동할 업무 ID
     * @param dto    업무 이동 요청 DTO
     * @return 성공 응답
     */
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

    /**
     * 엑셀 파일을 업로드하여 업무를 대량 등록합니다.
     *
     * @param projectId 프로젝트 ID
     * @param file      엑셀 파일
     * @return 등록된 업무 수
     */
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

    /**
     * 프로젝트의 모든 업무를 엑셀 파일로 다운로드합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 엑셀 파일 (바이트 배열)
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
