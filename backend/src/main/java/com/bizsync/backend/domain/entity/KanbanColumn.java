package com.bizsync.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;
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
