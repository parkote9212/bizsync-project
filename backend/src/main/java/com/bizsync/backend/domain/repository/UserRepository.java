package com.bizsync.backend.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.domain.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmpNo(String empNo);

    List<User> findByNameContainingOrEmailContaining(String name, String email);

    Page<User> findByStatus(AccountStatus status, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:keyword IS NULL OR u.name LIKE %:keyword% OR u.email LIKE %:keyword%)")
    Page<User> findByStatusAndRoleAndKeyword(
            @Param("status") AccountStatus status,
            @Param("role") Role role,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByRole(Role role);

    long countByStatus(AccountStatus status);

    default User findByIdOrThrow(Long userId) {
        return findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
    }

    default User findByEmailOrThrow(String email) {
        return findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
    }
}
