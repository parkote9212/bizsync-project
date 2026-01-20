package com.bizsync.backend.domain.repository;

import com.bizsync.backend.domain.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    // 프로젝트아이디에 특정 유저가 멤머로 있늕지 확인
    boolean existsByProject_ProjectIdAndUser_UserId(Long projectId, Long currentUserId);

    // 내가 속한 프로젝트 목록 조회
    @Query("SELECT pm FROM ProjectMember pm JOIN FETCH pm.project WHERE pm.user.userId = :userId")
    List<ProjectMember> findAllByUser_UserId(@Param("userId") Long userId);
}
