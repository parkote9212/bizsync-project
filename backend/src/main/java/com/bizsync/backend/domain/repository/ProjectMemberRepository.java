package com.bizsync.backend.domain.repository;

import com.bizsync.backend.domain.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    // 프로젝트아이디에 특정 유저가 멤머로 있늕지 확인
    boolean existsByProject_ProjectIdAndUser_UserId(Long projectId, Long currentUserId);
}
