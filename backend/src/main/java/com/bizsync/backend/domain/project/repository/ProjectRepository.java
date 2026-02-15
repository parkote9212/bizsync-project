package com.bizsync.backend.domain.project.repository;

import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.project.entity.ProjectStatus;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, ProjectRepositoryCustom {

    /**
     * ID로 프로젝트 조회 (없으면 예외 발생)
     */
    default Project findByIdOrThrow(Long projectId) {
        return findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
    }

    long countByStatus(ProjectStatus status);

    /**
     * (Spring Batch 전용) 상태 + 종료일 기준으로 프로젝트를 조회합니다. (페이징)
     *
     * @param status 조회할 프로젝트 상태
     * @param endDate 종료일 기준(이 날짜보다 이전 종료된 프로젝트)
     * @param pageable 페이징 정보
     * @return 조건에 해당하는 프로젝트 페이지
     */
    Page<Project> findByStatusAndEndDateBefore(ProjectStatus status, LocalDate endDate, Pageable pageable);
}
