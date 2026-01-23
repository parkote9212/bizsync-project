package com.bizsync.backend.domain.repository;

import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.ProjectStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * ✅ 비관적 락(Pessimistic Lock)을 사용한 프로젝트 조회
     *
     * @param id 프로젝트 ID
     * @return 락이 걸린 프로젝트 엔티티
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p WHERE p.projectId = :id")
    Optional<Project> findByIdForUpdate(@Param("id") Long id);

    /**
     * ID로 프로젝트 조회 (없으면 예외 발생)
     */
    default Project findByIdOrThrow(Long projectId) {
        return findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
    }

    /**
     * 비관적 락을 사용한 프로젝트 조회 (없으면 예외 발생)
     */
    default Project findByIdForUpdateOrThrow(Long projectId) {
        return findByIdForUpdate(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
    }

    long countByStatus(ProjectStatus status);
}
