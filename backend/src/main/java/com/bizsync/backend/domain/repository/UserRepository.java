package com.bizsync.backend.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bizsync.backend.domain.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmpNo(String empNo);

    // 이름 또는 이메일로 사용자 검색
    List<User> findByNameContainingOrEmailContaining(String name, String email);
}
