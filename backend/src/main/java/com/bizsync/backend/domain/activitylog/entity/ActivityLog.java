package com.bizsync.backend.domain.activitylog.entity;

import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.global.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 활동 로그 엔티티
 * 시스템 내 주요 활동을 기록
 *
 * @author BizSync Team
 */
@Entity
@Table(name = "activity_log", indexes = {
        @Index(name = "idx_project_created_at", columnList = "project_id, created_at"),
        @Index(name = "idx_user_created_at", columnList = "user_id, created_at"),
        @Index(name = "idx_entity", columnList = "entity_type, entity_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ActivityLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    /**
     * 활동을 수행한 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 활동이 발생한 프로젝트 (프로젝트 관련 활동인 경우)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    /**
     * 활동 설명
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String action;

    /**
     * 활동 대상 엔티티 타입 (PROJECT, TASK, APPROVAL 등)
     */
    @Column(name = "entity_type", length = 50)
    private String entityType;

    /**
     * 활동 대상 엔티티 ID
     */
    @Column(name = "entity_id")
    private Long entityId;

    /**
     * 활동 대상 엔티티 이름
     */
    @Column(name = "entity_name", length = 200)
    private String entityName;

    /**
     * 변경 전 값 (JSON 형태)
     */
    @Column(name = "before_value", columnDefinition = "TEXT")
    private String beforeValue;

    /**
     * 변경 후 값 (JSON 형태)
     */
    @Column(name = "after_value", columnDefinition = "TEXT")
    private String afterValue;

    /**
     * IP 주소
     */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    /**
     * 사용자 에이전트
     */
    @Column(name = "user_agent", length = 500)
    private String userAgent;
}
