package com.bizsync.backend.dto.request;

import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.domain.entity.ApprovalLine;
import com.bizsync.backend.domain.entity.ApprovalStatus;

import java.time.LocalDateTime;

public record ApprovalSummaryDTO(
        Long documentId,
        String title,
        String drafterName,
        ApprovalStatus docStatus,
        LocalDateTime createdAt
) {
    public static ApprovalSummaryDTO from(ApprovalDocument doc) {
        return new ApprovalSummaryDTO(
                doc.getDocumentId(),
                doc.getTitle(),
                doc.getDrafter().getName(),
                doc.getStatus(),
                doc.getCreatedAt()
        );
    }

    // -> 결재선(Line)을 통해 원본 문서(Document) 정보를 가져옴
    public static ApprovalSummaryDTO from(ApprovalLine line) {
        return ApprovalSummaryDTO.from(line.getDocument());
    }
}
