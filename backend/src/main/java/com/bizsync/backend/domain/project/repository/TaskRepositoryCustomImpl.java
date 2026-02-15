package com.bizsync.backend.domain.project.repository;

import com.bizsync.backend.domain.project.entity.Task;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

import static com.bizsync.backend.domain.project.entity.QKanbanColumn.kanbanColumn;
import static com.bizsync.backend.domain.project.entity.QProject.project;
import static com.bizsync.backend.domain.project.entity.QTask.task;
import static com.bizsync.backend.domain.user.entity.QUser.user;

/**
 * TaskRepository의 QueryDSL 기반 커스텀 쿼리 구현체
 */
@RequiredArgsConstructor
public class TaskRepositoryCustomImpl implements TaskRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    /**
     * 프로젝트의 모든 업무 조회 (컬럼 순서, 태스크 순서대로 정렬)
     * MyBatis의 association 중첩 구조를 대체하기 위해 fetch join 사용
     */
    @Override
    public List<Task> findTasksByProjectIdOrderByColumnSequenceAndTaskSequence(Long projectId) {
        return queryFactory
                .selectFrom(task)
                .innerJoin(task.column, kanbanColumn).fetchJoin()
                .innerJoin(kanbanColumn.project, project).fetchJoin()
                .leftJoin(task.worker, user).fetchJoin()
                .where(kanbanColumn.project.projectId.eq(projectId))
                .orderBy(
                        kanbanColumn.sequence.asc(),
                        task.sequence.asc()
                )
                .fetch();
    }
}
