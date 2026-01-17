package com.bizsync.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_line")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ApprovalLine {

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
    private ApprovalStatus status;

    private LocalDateTime approvedAt;

    private String comment;


    public void approve(String comment) {
        this.status = ApprovalStatus.APPROVED;
        this.approvedAt = LocalDateTime.now();
        this.comment = comment;
    }

    public void reject(String comment) {
        this.status = ApprovalStatus.REJECTED;
        this.approvedAt = LocalDateTime.now();
        this.comment = comment;
    }
}