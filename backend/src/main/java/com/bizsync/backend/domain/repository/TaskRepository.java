package com.bizsync.backend.domain.repository;

import com.bizsync.backend.domain.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // 해당 컬럼에서 가장 큰 순서 값 가져오기
    @Query("SELECT COALESCE(MAX(t.sequence), 0) FROM Task t WHERE t.column.columnId = :columnId")
    Integer findMaxSequence(@Param("columnId") Long columnId);
}