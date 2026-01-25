package com.bizsync.backend.domain.entity;

import com.bizsync.backend.common.exception.BusinessException;
import com.bizsync.backend.common.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_line")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ApprovalLine extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private ApprovalDocument document;

    // 결재자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Column(nullable = false)
    private Integer sequence;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ApprovalStatus status;

    private LocalDateTime approvedAt;

    private String comment;

    public void approve(String comment) {
        this.status = ApprovalStatus.APPROVED;
        this.comment = comment;
        this.approvedAt = LocalDateTime.now();
    }

    public void reject(String comment) {
        if (comment == null || comment.trim().isEmpty()) {
            throw new BusinessException(ErrorCode.APPROVAL_REJECT_COMMENT_REQUIRED);
        }
        this.status = ApprovalStatus.REJECTED;
        this.comment = comment;
        this.approvedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = ApprovalStatus.CANCELLED;
        this.approvedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = ApprovalStatus.PENDING;
        }
    }
}
