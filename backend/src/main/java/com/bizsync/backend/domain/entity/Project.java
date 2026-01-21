package com.bizsync.backend.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long projectId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "total_budget", precision = 19, scale = 2)
    private BigDecimal totalBudget;

    @Column(name = "used_budget", precision = 19, scale = 2)
    private BigDecimal usedBudget;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'IN_PROGRESS'")
    @Builder.Default
    private ProjectStatus status = ProjectStatus.IN_PROGRESS;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.usedBudget == null)
            this.usedBudget = BigDecimal.ZERO;
        if (this.status == null)
            this.status = ProjectStatus.IN_PROGRESS;
    }

    public void spendBudget(BigDecimal amount) {

        BigDecimal expectedUsage = this.usedBudget.add(amount);

        if (this.totalBudget.compareTo(expectedUsage) < 0) {
            throw new IllegalStateException("예산이 초과되었습니다.");
        }
        this.usedBudget = expectedUsage;
    }

    /**
     * 프로젝트를 완료 상태로 변경
     */
    public void complete() {
        this.status = ProjectStatus.COMPLETED;
    }

    /**
     * 프로젝트를 재시작 (진행중 상태로 변경)
     */
    public void reopen() {
        if (this.status == ProjectStatus.COMPLETED || this.status == ProjectStatus.ON_HOLD) {
            this.status = ProjectStatus.IN_PROGRESS;
        }
    }

    /**
     * 프로젝트가 진행중인지 확인
     */
    public boolean isInProgress() {
        return this.status == ProjectStatus.IN_PROGRESS;
    }

    /**
     * 프로젝트가 완료되었는지 확인
     */
    public boolean isCompleted() {
        return this.status == ProjectStatus.COMPLETED;
    }

    /**
     * 프로젝트 정보 수정
     */
    public void update(String name, String description, LocalDate startDate, LocalDate endDate, BigDecimal totalBudget) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        if (description != null) {
            this.description = description;
        }
        if (startDate != null) {
            this.startDate = startDate;
        }
        if (endDate != null) {
            this.endDate = endDate;
        }
        if (totalBudget != null) {
            this.totalBudget = totalBudget;
        }
    }
}
