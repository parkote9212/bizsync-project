package com.bizsync.backend.mapper;

import com.bizsync.backend.domain.entity.Task;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TaskMapper {

    /**
     * 프로젝트의 모든 업무 조회 (컬럼 순서, 태스크 순서대로 정렬)
     */
    List<Task> selectTasksByProjectIdOrderByColumnSequenceAndTaskSequence(@Param("projectId") Long projectId);
}
