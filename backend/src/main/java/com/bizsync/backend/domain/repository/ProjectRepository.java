package com.bizsync.backend.domain.repository;

import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * ID로 프로젝트 조회 (없으면 예외 발생)
     */
    default Project findByIdOrThrow(Long projectId) {
        return findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
    }

    long countByStatus(ProjectStatus status);
}
