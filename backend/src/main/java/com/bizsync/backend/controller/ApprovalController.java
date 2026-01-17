package com.bizsync.backend.controller;

import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.dto.request.ApprovalCreateRequestDTO;
import com.bizsync.backend.dto.request.ApprovalProcessRequestDTO;
import com.bizsync.backend.dto.request.ApprovalSummaryDTO;
import com.bizsync.backend.service.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    // 기안 상신 (문서 생성)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createApproval(
            @Valid @RequestBody ApprovalCreateRequestDTO dto
    ) {
        // 로그인한 사용자(기안자) ID 가져오기
        Long drafterId = SecurityUtil.getCurrentUserIdOrThrow();

        Long documentId = approvalService.createApproval(drafterId, dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "결재 상신이 완료되었습니다.",
                        "documentId", documentId
                ));
    }

    @PostMapping("/{documentId}/process")
    public ResponseEntity<String> processApproval(
            @PathVariable Long documentId,
            @Valid @RequestBody ApprovalProcessRequestDTO dto
    ) {
        Long approverId = SecurityUtil.getCurrentUserIdOrThrow();

        approvalService.processApproval(documentId, approverId, dto);

        return ResponseEntity.ok("결재가 정상적으로 처리되었습니다.");
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
}