package com.bizsync.backend.domain.activitylog.repository;

import com.bizsync.backend.domain.activitylog.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ActivityLog 리포지토리
 *
 * @author BizSync Team
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /**
     * 프로젝트의 활동 로그 조회 (페이징)
     *
     * @param projectId 프로젝트 ID
     * @param pageable  페이징 정보
     * @return 활동 로그 목록
     */
    Page<ActivityLog> findByProject_ProjectId(Long projectId, Pageable pageable);

    /**
     * 사용자의 활동 로그 조회 (페이징)
     *
     * @param userId   사용자 ID
     * @param pageable 페이징 정보
     * @return 활동 로그 목록
     */
    Page<ActivityLog> findByUser_UserId(Long userId, Pageable pageable);

    /**
     * 특정 엔티티의 활동 로그 조회
     *
     * @param entityType 엔티티 타입
     * @param entityId   엔티티 ID
     * @param pageable   페이징 정보
     * @return 활동 로그 목록
     */
    Page<ActivityLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);

    /**
     * 특정 기간 이전의 활동 로그 삭제 (배치 작업용)
     *
     * @param beforeDate 기준 일자
     */
    @Modifying
    @Query("DELETE FROM ActivityLog al WHERE al.createdAt < :beforeDate")
    void deleteActivityLogsBefore(@Param("beforeDate") LocalDateTime beforeDate);

    /**
     * 최근 프로젝트 활동 조회 (TOP N)
     *
     * @param projectId 프로젝트 ID
     * @param limit     제한 개수
     * @return 활동 로그 목록
     */
    @Query("SELECT al FROM ActivityLog al " +
            "WHERE al.project.projectId = :projectId " +
            "ORDER BY al.createdAt DESC")
    List<ActivityLog> findRecentByProjectId(@Param("projectId") Long projectId, Pageable pageable);
}
