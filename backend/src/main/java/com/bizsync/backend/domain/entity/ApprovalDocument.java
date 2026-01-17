package com.bizsync.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_document")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ApprovalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    // 기안자 (문서 작성자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drafter_id", nullable = false)
    private User drafter;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status; // 문서 전체 상태 (진행중/완료/반려)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = ApprovalStatus.PENDING;
    }

    public void approve() {
        this.status = ApprovalStatus.APPROVED;
        this.completedAt = LocalDateTime.now();
    }

    public void reject() {
        this.status = ApprovalStatus.REJECTED;
        this.completedAt = LocalDateTime.now();
    }
}