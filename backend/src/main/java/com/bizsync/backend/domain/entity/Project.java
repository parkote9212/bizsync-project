package com.bizsync.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;


    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if(this.usedBudget == null) this.usedBudget = BigDecimal.ZERO;
    }

    public void spendBudget(BigDecimal amount){

        BigDecimal expectedUsage = this.usedBudget.add(amount);

        if(this.totalBudget.compareTo(expectedUsage) < 0){
            throw new IllegalStateException("예산이 초과되었습니다.");
        }
        this.usedBudget = expectedUsage;
    }
}
