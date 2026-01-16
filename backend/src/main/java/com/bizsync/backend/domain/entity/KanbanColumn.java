package com.bizsync.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kanban_column")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class KanbanColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "column_id")
    private Long columnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 50)
    private String name; // 컬럼명 (예: To Do, Done)

    @Column(nullable = false)
    private Integer sequence; // 순서 (1, 2, 3...)
}