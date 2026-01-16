package com.bizsync.backend.mapper;

import com.bizsync.backend.dto.response.kanban.ProjectBoardDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface ProjectMapper {

    /**
     * 프로젝트 상세 + 칸반 컬럼 + 업무 목록을 한 번에 조회
     * userId를 넘기는 이유: 해당 유저가 이 프로젝트의 멤버인지 체크하거나,
     * 내 업무만 필터링하는 등의 확장을 대비함 (지금 쿼리엔 없어도 됨)
     */

    Optional<ProjectBoardDTO> selectProjectBoard(@Param("projectId") Long projectId);

}
