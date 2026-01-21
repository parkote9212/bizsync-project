package com.bizsync.backend.dto.response;

import com.bizsync.backend.domain.entity.ApprovalLine;
import com.bizsync.backend.domain.entity.ApprovalStatus;

/**
 * 결재선 상세 (결재 상세 조회 시 사용)
 */
public record ApprovalLineDetailDTO(
        Integer sequence,
        String approverName,
        ApprovalStatus status,
        String comment
) {
    public static ApprovalLineDetailDTO from(ApprovalLine line) {
        return new ApprovalLineDetailDTO(
                line.getSequence(),
                line.getApprover().getName(),
                line.getStatus(),
                line.getComment()
        );
    }
}
