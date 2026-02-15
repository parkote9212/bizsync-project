package com.bizsync.backend.domain.project.repository;

import com.bizsync.backend.domain.project.dto.response.ProjectListResponseDTO;
import com.bizsync.backend.domain.project.dto.response.kanban.ProjectBoardDTO;

import java.util.List;
import java.util.Optional;

/**
 * ProjectRepository의 QueryDSL 기반 커스텀 쿼리 인터페이스
 */
public interface ProjectRepositoryCustom {

    /**
     * 프로젝트 상세 + 칸반 컬럼 + 업무 목록을 한 번에 조회
     * (기존 ProjectMapper.selectProjectBoard 대체)
     *
     * @param projectId 조회할 프로젝트 ID
     * @return 프로젝트 보드 DTO (칸반 컬럼과 태스크 포함)
     */
    Optional<ProjectBoardDTO> findProjectBoard(Long projectId);

    /**
     * 사용자가 멤버로 참여한 프로젝트 목록 조회 (N+1 문제 해결)
     * ProjectMember와 Project를 JOIN하여 한 번의 쿼리로 조회
     * (기존 ProjectMapper.selectMyProjects 대체)
     *
     * @param userId 사용자 ID
     * @return 참여 중인 프로젝트 목록
     */
    List<ProjectListResponseDTO> findMyProjects(Long userId);
}
