package com.bizsync.backend.domain.project.repository;

import com.bizsync.backend.domain.project.entity.KanbanColumn;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.exception.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, Long> {

    // 해당 프로젝트에서 가장 큰 순서 값 가져오기 (없으면 0 반환)
    @Query("SELECT COALESCE(MAX(c.sequence), 0) FROM KanbanColumn c WHERE c.project.projectId = :projectId")
    Integer findMaxSequence(@Param("projectId") Long projectId);

    Optional<KanbanColumn> findByProject_ProjectIdAndName(Long projectId, String columnName);

    // 프로젝트의 모든 컬럼 조회
    List<KanbanColumn> findByProject_ProjectId(Long projectId);

    /**
     * ID로 칸반 컬럼 조회 (없으면 예외 발생)
     */
    default KanbanColumn findByIdOrThrow(Long columnId) {
        return findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.KANBAN_COLUMN_NOT_FOUND));
    }

    /**
     * 프로젝트 ID와 이름으로 칸반 컬럼 조회 (없으면 예외 발생)
     */
    default KanbanColumn findByProjectIdAndNameOrThrow(Long projectId, String columnName) {
        return findByProject_ProjectIdAndName(projectId, columnName)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.KANBAN_COLUMN_NOT_FOUND));
    }
}
