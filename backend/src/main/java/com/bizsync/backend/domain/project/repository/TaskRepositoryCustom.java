package com.bizsync.backend.domain.project.repository;

import com.bizsync.backend.domain.project.entity.Task;

import java.util.List;

/**
 * TaskRepository의 QueryDSL 기반 커스텀 쿼리 인터페이스
 */
public interface TaskRepositoryCustom {

    /**
     * 프로젝트의 모든 업무 조회 (컬럼 순서, 태스크 순서대로 정렬)
     * (기존 TaskMapper.selectTasksByProjectIdOrderByColumnSequenceAndTaskSequence 대체)
     *
     * @param projectId 프로젝트 ID
     * @return 태스크 목록 (컬럼, 프로젝트, 담당자 정보 포함)
     */
    List<Task> findTasksByProjectIdOrderByColumnSequenceAndTaskSequence(Long projectId);
}
