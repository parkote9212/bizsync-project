package com.bizsync.backend.domain.repository;

import com.bizsync.backend.domain.entity.KanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, Long> {

    // 해당 프로젝트에서 가장 큰 순서 값 가져오기 (없으면 0 반환)
    @Query("SELECT COALESCE(MAX(c.sequence), 0) FROM KanbanColumn c WHERE c.project.projectId = :projectId")
    Integer findMaxSequence(@Param("projectId") Long projectId);
}