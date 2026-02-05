package com.bizsync.backend.domain.project.entity;

import com.bizsync.backend.global.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "kanban_column")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class KanbanColumn extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "column_id")
    private Long columnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 50)
    private String name; // 컬럼명 (예: To Do, Done)

    @Column(length = 500)
    private String description; // 컬럼 설명

    @Column(nullable = false)
    @Builder.Default
    private Integer sequence = 0; // 순서 (1, 2, 3...)

    @Enumerated(EnumType.STRING)
    @Column(name = "column_type", nullable = false, length = 20)
    @ColumnDefault("'IN_PROGRESS'")
    @Builder.Default
    private ColumnType columnType = ColumnType.IN_PROGRESS;

    /**
     * 컬럼이 완료(DONE) 타입인지 확인
     */
    public boolean isDone() {
        return this.columnType == ColumnType.DONE;
    }
}
