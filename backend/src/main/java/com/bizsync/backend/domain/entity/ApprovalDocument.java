package com.bizsync.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_document")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ApprovalDocument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    // 기안자 (문서 작성자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drafter_id", nullable = false)
    private User drafter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    // 결재 유형(휴가/비용/업무)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApprovalType type;

    // 문서 전체 상태 (진행중/완료/반려)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        if (this.status == null)
            this.status = ApprovalStatus.PENDING;
    }

    // 승인
    public void approve() {
        this.status = ApprovalStatus.APPROVED;
        this.completedAt = LocalDateTime.now();
    }

    // 반려
    public void reject() {
        this.status = ApprovalStatus.REJECTED;
        this.completedAt = LocalDateTime.now();
    }

    /**
     * 취소
     */
    public void cancel() {
        this.status = ApprovalStatus.CANCELLED;
        this.completedAt = LocalDateTime.now();
    }

    /**
     * 비용 결재인지 확인
     */
    public boolean isExpenseApproval() {
        return this.type == ApprovalType.EXPENSE;
    }

}
