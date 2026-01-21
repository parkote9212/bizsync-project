package com.bizsync.backend.dto.response;

import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.domain.entity.ApprovalLine;
import com.bizsync.backend.domain.entity.ApprovalStatus;
import com.bizsync.backend.domain.entity.ApprovalType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 결재 문서 상세 (GET /api/approvals/{documentId} 응답)
 */
public record ApprovalDetailDTO(
        Long documentId,
        String title,
        String content,
        ApprovalType type,
        BigDecimal amount,
        ApprovalStatus status,
        String drafterName,
        String department,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,
        List<ApprovalLineDetailDTO> approvalLines
) {
    public static ApprovalDetailDTO from(ApprovalDocument document, List<ApprovalLine> lines) {
        List<ApprovalLineDetailDTO> lineDtos = lines.stream()
                .map(ApprovalLineDetailDTO::from)
                .toList();

        String dept = document.getDrafter().getDepartment();
        if (dept == null) {
            dept = "";
        }

        return new ApprovalDetailDTO(
                document.getDocumentId(),
                document.getTitle(),
                document.getContent(),
                document.getType(),
                document.getAmount(),
                document.getStatus(),
                document.getDrafter().getName(),
                dept,
                document.getCreatedAt(),
                lineDtos
        );
    }
}
