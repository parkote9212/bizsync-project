package com.bizsync.backend.controller;

import java.util.Map;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.dto.request.ApprovalCreateRequestDTO;
import com.bizsync.backend.dto.request.ApprovalProcessRequestDTO;
import com.bizsync.backend.dto.request.ApprovalSummaryDTO;
import com.bizsync.backend.dto.response.ApprovalDetailDTO;
import com.bizsync.backend.service.ApprovalService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    /**
     * 결재 기안 (상신)
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createApproval(
            @Valid @RequestBody ApprovalCreateRequestDTO dto
    ) {
        // 비용 결재 검증
        dto.validateExpenseApproval();

        // 로그인한 사용자(기안자) ID 가져오기
        Long drafterId = SecurityUtil.getCurrentUserIdOrThrow();

        Long documentId = approvalService.createApproval(drafterId, dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "결재 상신이 완료되었습니다.",
                        "documentId", documentId
                ));
    }

    /**
     * 결재 취소 (기안자가 PENDING 상태만 가능)
     */
    @PostMapping("/{documentId}/cancel")
    public ResponseEntity<Map<String, String>> cancelApproval(@PathVariable Long documentId) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        approvalService.cancelApproval(userId, documentId);
        return ResponseEntity.ok(Map.of("message", "결재가 취소되었습니다."));
    }

    @PostMapping("/{documentId}/process")
    public ResponseEntity<String> processApproval(
            @PathVariable Long documentId,
            @Valid @RequestBody ApprovalProcessRequestDTO dto
    ) {
        Long approverId = SecurityUtil.getCurrentUserIdOrThrow();

        approvalService.processApproval(approverId, documentId, dto);

        return ResponseEntity.ok("결재가 정상적으로 처리되었습니다.");
    }

    /**
     * 결재 상세 조회 (기안자 또는 결재선에 포함된 사용자만)
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<ApprovalDetailDTO> getApprovalDetail(@PathVariable Long documentId) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(approvalService.getApprovalDetail(userId, documentId));
    }

    @GetMapping("/my-drafts")
    public ResponseEntity<Page<ApprovalSummaryDTO>> getMyDrafts(
            @ParameterObject
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(approvalService.getMyDrafts(userId, pageable));
    }

    @GetMapping("/my-pending")
    public ResponseEntity<Page<ApprovalSummaryDTO>> getMyPending(
            // PageableDefault: 기본적으로 id 역순(최신순) 정렬
            @ParameterObject
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(approvalService.getMyPendingApprovals(userId, pageable));
    }

    /**
     * 내 결재 완료함 (내가 결재한 문서 중 APPROVED 또는 REJECTED 상태)
     */
    @GetMapping("/my-completed")
    public ResponseEntity<Page<ApprovalSummaryDTO>> getMyCompleted(
            @ParameterObject
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(approvalService.getMyCompletedApprovals(userId, pageable));
    }
}
