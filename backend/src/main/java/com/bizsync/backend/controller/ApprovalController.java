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

/**
 * 결재 관련 REST API 컨트롤러
 * 
 * <p>결재 문서 생성, 승인/반려 처리, 취소, 조회 등의 API를 제공합니다.
 * 
 * @author BizSync Team
 */
@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    /**
     * 결재 문서를 생성합니다.
     * 
     * @param dto 결재 생성 요청 DTO
     * @return 생성된 결재 문서 ID
     */
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

    /**
     * 결재 문서를 취소합니다.
     * 
     * @param documentId 취소할 결재 문서 ID
     * @return 성공 응답
     */
    @PostMapping("/{documentId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelApproval(@PathVariable Long documentId) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        approvalService.cancelApproval(userId, documentId);
        return ResponseEntity.ok(ApiResponse.success("결재가 취소되었습니다."));
    }

    /**
     * 결재를 승인하거나 반려 처리합니다.
     * 
     * @param documentId 결재 문서 ID
     * @param dto 결재 처리 요청 DTO
     * @return 성공 응답
     */
    @PostMapping("/{documentId}/process")
    public ResponseEntity<ApiResponse<Void>> processApproval(
            @PathVariable Long documentId,
            @Valid @RequestBody ApprovalProcessRequestDTO dto
    ) {
        Long approverId = SecurityUtil.getCurrentUserIdOrThrow();
        approvalService.processApproval(approverId, documentId, dto);
        return ResponseEntity.ok(ApiResponse.success("결재가 정상적으로 처리되었습니다."));
    }

    /**
     * 결재 문서 상세 정보를 조회합니다.
     * 
     * @param documentId 조회할 결재 문서 ID
     * @return 결재 상세 정보
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<ApiResponse<ApprovalDetailDTO>> getApprovalDetail(@PathVariable Long documentId) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getApprovalDetail(userId, documentId)));
    }

    /**
     * 사용자가 기안한 결재 문서 목록을 조회합니다.
     * 
     * @param pageable 페이지 정보
     * @return 기안한 결재 문서 목록
     */
    @GetMapping("/my-drafts")
    public ResponseEntity<ApiResponse<Page<ApprovalSummaryDTO>>> getMyDrafts(
            @ParameterObject
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getMyDrafts(userId, pageable)));
    }

    /**
     * 사용자에게 대기 중인 결재 목록을 조회합니다.
     * 
     * @param pageable 페이지 정보
     * @return 대기 중인 결재 목록
     */
    @GetMapping("/my-pending")
    public ResponseEntity<ApiResponse<Page<ApprovalSummaryDTO>>> getMyPending(
            @ParameterObject
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getMyPendingApprovals(userId, pageable)));
    }

    /**
     * 사용자가 처리한 결재 목록을 조회합니다.
     * 
     * @param pageable 페이지 정보
     * @return 처리 완료된 결재 목록
     */
    @GetMapping("/my-completed")
    public ResponseEntity<ApiResponse<Page<ApprovalSummaryDTO>>> getMyCompleted(
            @ParameterObject
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getMyCompletedApprovals(userId, pageable)));
    }
}
