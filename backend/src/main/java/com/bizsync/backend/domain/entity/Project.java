package com.bizsync.backend.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.bizsync.backend.common.exception.BusinessException;
import com.bizsync.backend.common.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "project")
@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Project extends BaseEntity {

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
    @Builder.Default
    private BigDecimal usedBudget = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'PLANNING'")
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PLANNING;

    @PrePersist
    public void prePersist() {
        if (this.usedBudget == null)
            this.usedBudget = BigDecimal.ZERO;
        if (this.status == null)
            this.status = ProjectStatus.PLANNING;
    }

    public void spendBudget(BigDecimal amount) {
        BigDecimal expectedUsage = this.usedBudget.add(amount);

        if (this.totalBudget.compareTo(expectedUsage) < 0) {
            throw new BusinessException(ErrorCode.BUDGET_EXCEEDED);
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
     * 프로젝트를 시작 (기획중에서 진행중으로 변경)
     */
    public void start() {
        if (this.status == ProjectStatus.PLANNING) {
            this.status = ProjectStatus.IN_PROGRESS;
        }
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
     * (캐시 직렬화 제외 - status에서 파생)
     */
    @JsonIgnore
    public boolean isInProgress() {
        return this.status == ProjectStatus.IN_PROGRESS;
    }

    /**
     * 프로젝트가 완료되었는지 확인
     * (캐시 직렬화 제외 - status에서 파생되므로 중복 방지)
     */
    @JsonIgnore
    public boolean isCompleted() {
        return this.status == ProjectStatus.COMPLETED;
    }

    /**
     * 프로젝트를 취소 상태로 변경 (소프트 삭제)
     */
    public void cancel() {
        this.status = ProjectStatus.CANCELLED;
    }

    /**
     * 프로젝트를 아카이빙 상태로 변경
     * 
     * <p>종료된 프로젝트 중 일정 기간이 지난 프로젝트를 아카이빙 처리합니다.
     * Spring Batch로 매일 새벽 자동 실행됩니다.
     */
    public void archive() {
        if (this.status == ProjectStatus.COMPLETED) {
            this.status = ProjectStatus.ARCHIVED;
        }
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
