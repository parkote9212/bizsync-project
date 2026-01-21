package com.bizsync.backend.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bizsync.backend.domain.entity.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * 프로젝트의 모든 업무 조회 (컬럼 순서, 태스크 순서대로 정렬)
     */
    List<Task> findByColumn_Project_ProjectIdOrderByColumn_SequenceAscSequenceAsc(Long projectId);

    // 해당 컬럼에서 가장 큰 순서 값 가져오기
    @Query("SELECT COALESCE(MAX(t.sequence), 0) FROM Task t WHERE t.column.columnId = :columnId")
    Integer findMaxSequence(@Param("columnId") Long columnId);

    /**
     * 특정 컬럼의 최대 시퀀스 조회
     */
    @Query("SELECT MAX(t.sequence) FROM Task t WHERE t.column.columnId = :columnId")
    Optional<Integer> findMaxSequenceByColumnId(@Param("columnId") Long columnId);

    // 내 업무 수 (전체)
    long countByWorker_UserId(Long userId);
}
