package com.bizsync.backend.domain.project.repository;

import com.bizsync.backend.domain.project.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.domain.project.dto.response.kanban.KanbanColumnDTO;
import com.bizsync.backend.domain.project.dto.response.kanban.ProjectBoardDTO;
import com.bizsync.backend.domain.project.dto.response.kanban.TaskDTO;
import com.bizsync.backend.domain.project.entity.ProjectStatus;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.bizsync.backend.domain.project.entity.QKanbanColumn.kanbanColumn;
import static com.bizsync.backend.domain.project.entity.QProject.project;
import static com.bizsync.backend.domain.project.entity.QProjectMember.projectMember;
import static com.bizsync.backend.domain.project.entity.QTask.task;
import static com.bizsync.backend.domain.user.entity.QUser.user;

/**
 * ProjectRepository의 QueryDSL 기반 커스텀 쿼리 구현체
 */
@RequiredArgsConstructor
public class ProjectRepositoryCustomImpl implements ProjectRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    /**
     * 프로젝트 상세 + 칸반 컬럼 + 업무 목록을 한 번에 조회
     * MyBatis의 중첩 ResultMap을 대체하기 위해 데이터를 조회한 후 애플리케이션 레벨에서 그룹화
     */
    @Override
    public Optional<ProjectBoardDTO> findProjectBoard(Long projectId) {
        // 1. 프로젝트 기본 정보 조회
        ProjectBoardDTO projectInfo = queryFactory
                .select(Projections.fields(ProjectBoardDTO.class,
                        project.projectId,
                        project.name,
                        project.totalBudget,
                        project.usedBudget,
                        project.startDate,
                        project.endDate,
                        project.status.stringValue().as("status")
                ))
                .from(project)
                .where(project.projectId.eq(projectId))
                .fetchOne();

        if (projectInfo == null) {
            return Optional.empty();
        }

        // 2. 컬럼과 태스크를 LEFT JOIN으로 한 번에 조회 (MyBatis XML과 동일한 JOIN 구조)
        List<ColumnTaskProjection> columnTaskList = queryFactory
                .select(Projections.fields(ColumnTaskProjection.class,
                        kanbanColumn.columnId,
                        kanbanColumn.name.as("columnName"),
                        kanbanColumn.sequence.as("columnSequence"),
                        kanbanColumn.columnType.stringValue().as("columnType"),
                        task.taskId,
                        task.title.as("taskTitle"),
                        task.content.as("taskContent"),
                        task.sequence.as("taskSequence"),
                        task.deadline,
                        user.userId.as("workerId"),
                        user.name.as("workerName")
                ))
                .from(kanbanColumn)
                .leftJoin(task).on(kanbanColumn.columnId.eq(task.column.columnId))
                .leftJoin(user).on(task.worker.userId.eq(user.userId))
                .where(kanbanColumn.project.projectId.eq(projectId))
                .orderBy(kanbanColumn.sequence.asc(), task.sequence.asc())
                .fetch();

        // 3. 컬럼별로 그룹화하여 DTO 구조 생성
        Map<Long, KanbanColumnDTO> columnMap = new LinkedHashMap<>();

        for (ColumnTaskProjection row : columnTaskList) {
            // 컬럼이 처음 등장하는 경우
            if (!columnMap.containsKey(row.columnId)) {
                KanbanColumnDTO column = KanbanColumnDTO.builder()
                        .columnId(row.columnId)
                        .name(row.columnName)
                        .sequence(row.columnSequence)
                        .columnType(row.columnType)
                        .tasks(new ArrayList<>())
                        .build();
                columnMap.put(row.columnId, column);
            }

            // 태스크가 있는 경우 추가 (LEFT JOIN이므로 taskId가 null일 수 있음)
            if (row.taskId != null) {
                TaskDTO taskDTO = TaskDTO.builder()
                        .taskId(row.taskId)
                        .title(row.taskTitle)
                        .content(row.taskContent)
                        .sequence(row.taskSequence)
                        .deadline(row.deadline)
                        .workerId(row.workerId)
                        .workerName(row.workerName)
                        .build();
                columnMap.get(row.columnId).getTasks().add(taskDTO);
            }
        }

        // 4. 컬럼 리스트를 ProjectBoardDTO에 설정
        projectInfo.setColumns(new ArrayList<>(columnMap.values()));

        return Optional.of(projectInfo);
    }

    /**
     * 사용자가 멤버로 참여한 프로젝트 목록 조회
     * CANCELLED 상태는 제외 (삭제된 프로젝트는 목록에 표시하지 않음)
     */
    @Override
    public List<ProjectListResponseDTO> findMyProjects(Long userId) {
        return queryFactory
                .select(Projections.constructor(ProjectListResponseDTO.class,
                        project.projectId,
                        project.name,
                        project.description,
                        project.startDate,
                        project.endDate,
                        project.status.stringValue(),
                        project.totalBudget,
                        project.usedBudget
                ))
                .from(projectMember)
                .innerJoin(projectMember.project, project)
                .where(
                        projectMember.user.userId.eq(userId),
                        project.status.ne(ProjectStatus.CANCELLED)
                )
                .orderBy(project.projectId.desc())
                .fetch();
    }

    /**
     * 컬럼과 태스크 정보를 담는 프로젝션 클래스
     * QueryDSL의 Projections.fields()로 매핑하기 위한 내부 클래스
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ColumnTaskProjection {
        private Long columnId;
        private String columnName;
        private Integer columnSequence;
        private String columnType;
        private Long taskId;
        private String taskTitle;
        private String taskContent;
        private Integer taskSequence;
        private java.time.LocalDate deadline;
        private Long workerId;
        private String workerName;
    }
}
