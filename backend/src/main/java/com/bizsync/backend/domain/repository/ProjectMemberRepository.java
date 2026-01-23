package com.bizsync.backend.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.domain.entity.ProjectMember;
import com.bizsync.backend.domain.entity.ProjectStatus;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    /**
     * 프로젝트 ID와 사용자 ID로 프로젝트 멤버 조회
     */
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.projectId = :projectId AND pm.user.userId = :userId")
    Optional<ProjectMember> findByProjectAndUser(
            @Param("projectId") Long projectId,
            @Param("userId") Long userId
    );

    /**
     * 프로젝트에 특정 유저가 멤버로 있는지 확인
     */
    @Query("SELECT COUNT(pm) > 0 FROM ProjectMember pm WHERE pm.project.projectId = :projectId AND pm.user.userId = :userId")
    boolean existsByProjectAndUser(
            @Param("projectId") Long projectId,
            @Param("userId") Long userId
    );

    // 내가 속한 프로젝트 목록 조회
    @Query("SELECT pm FROM ProjectMember pm JOIN FETCH pm.project WHERE pm.user.userId = :userId")
    List<ProjectMember> findAllByUser_UserId(@Param("userId") Long userId);

    // 내 프로젝트 수 (전체)
    long countByUser_UserId(Long userId);

    // 내 프로젝트 수 (특정 상태)
    long countByUser_UserIdAndProject_Status(Long userId, ProjectStatus status);

    // 특정 프로젝트의 모든 멤버 조회
    @Query("SELECT pm FROM ProjectMember pm JOIN FETCH pm.user WHERE pm.project.projectId = :projectId")
    List<ProjectMember> findAllByProject_ProjectId(@Param("projectId") Long projectId);

    /**
     * 프로젝트 ID와 사용자 ID로 프로젝트 멤버 조회 (없으면 예외 발생)
     */
    default ProjectMember findByProjectIdAndUserIdOrThrow(Long projectId, Long userId) {
        return findByProjectAndUser(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_MEMBER_NOT_FOUND));
    }
}
