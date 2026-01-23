package com.bizsync.backend.controller;


import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.dto.request.ApprovalCreateRequestDTO;
import com.bizsync.backend.dto.request.ApprovalProcessRequestDTO;
import com.bizsync.backend.dto.request.ApprovalSummaryDTO;
import com.bizsync.backend.dto.response.ApiResponse;
import com.bizsync.backend.dto.response.ApprovalDetailDTO;
import com.bizsync.backend.service.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createApproval(
            @Valid @RequestBody ApprovalCreateRequestDTO dto
    ) {
        dto.validateExpenseApproval();
        Long drafterId = SecurityUtil.getCurrentUserIdOrThrow();
        Long documentId = approvalService.createApproval(drafterId, dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(documentId, "결재 상신이 완료되었습니다."));
    }

    @PostMapping("/{documentId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelApproval(@PathVariable Long documentId) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        approvalService.cancelApproval(userId, documentId);
        return ResponseEntity.ok(ApiResponse.success("결재가 취소되었습니다."));
    }

    @PostMapping("/{documentId}/process")
    public ResponseEntity<ApiResponse<Void>> processApproval(
            @PathVariable Long documentId,
            @Valid @RequestBody ApprovalProcessRequestDTO dto
    ) {
        Long approverId = SecurityUtil.getCurrentUserIdOrThrow();
        approvalService.processApproval(approverId, documentId, dto);
        return ResponseEntity.ok(ApiResponse.success("결재가 정상적으로 처리되었습니다."));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<ApiResponse<ApprovalDetailDTO>> getApprovalDetail(@PathVariable Long documentId) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getApprovalDetail(userId, documentId)));
    }

    @GetMapping("/my-drafts")
    public ResponseEntity<ApiResponse<Page<ApprovalSummaryDTO>>> getMyDrafts(
            @ParameterObject
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getMyDrafts(userId, pageable)));
    }

    @GetMapping("/my-pending")
    public ResponseEntity<ApiResponse<Page<ApprovalSummaryDTO>>> getMyPending(
            @ParameterObject
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getMyPendingApprovals(userId, pageable)));
    }

    @GetMapping("/my-completed")
    public ResponseEntity<ApiResponse<Page<ApprovalSummaryDTO>>> getMyCompleted(
            @ParameterObject
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getMyCompletedApprovals(userId, pageable)));
    }
}
