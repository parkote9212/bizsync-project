package com.bizsync.backend.domain.entity;

import java.time.LocalDate;

import org.hibernate.annotations.ColumnDefault;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "task")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Task extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    // 어느 컬럼에 속해있는지 (예: 진행 중)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id", nullable = false)
    private KanbanColumn column;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private User worker;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDate deadline;

    @Column(nullable = false)
    @ColumnDefault("0")
    private Integer sequence; // 컬럼 내에서의 카드 순서

    @PrePersist
    public void prePersist() {
        if (this.sequence == null)
            this.sequence = 0;
    }

    public void updateDetails(String title, String content, LocalDate deadline, User worker) {
        if (title != null)
            this.title = title;
        if (content != null)
            this.content = content;
        if (deadline != null)
            this.deadline = deadline;
        if (worker != null)
            this.worker = worker;
    }

    // 편의 메서드: 컬럼(이동)과 순서를 한 번에 업데이트
    public void updatePosition(KanbanColumn col, Integer seq) {
        if (col != null) {
            this.column = col;
        }
        if (seq != null) {
            this.sequence = seq;
        }
    }

    // 편의 메서드: 이 Task가 속한 Project의 ID를 반환 (널 안전성)
    public Long getProjectId() {
        if (this.column == null)
            return null;
        KanbanColumn col = this.column;
        if (col.getProject() == null)
            return null;
        return col.getProject().getProjectId();
    }

}
