package com.bizsync.backend.domain.approval.dto.response;

import com.bizsync.backend.domain.approval.entity.ApprovalLine;
import com.bizsync.backend.domain.approval.entity.ApprovalStatus;

/**
 * 결재선 상세 (결재 상세 조회 시 사용)
 */
public record ApprovalLineDetailDTO(
        Integer sequence,
        Long approverId,
        String approverName,
        ApprovalStatus status,
        String comment) {
    public static ApprovalLineDetailDTO from(ApprovalLine line) {
        return new ApprovalLineDetailDTO(
                line.getSequence(),
                line.getApprover().getUserId(),
                line.getApprover().getName(),
                line.getStatus(),
                line.getComment());
    }
}
