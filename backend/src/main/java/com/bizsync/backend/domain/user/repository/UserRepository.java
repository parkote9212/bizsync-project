package com.bizsync.backend.domain.user.repository;

import com.bizsync.backend.domain.user.entity.AccountStatus;
import com.bizsync.backend.domain.user.entity.Position;
import com.bizsync.backend.domain.user.entity.Role;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmpNo(String empNo);

    List<User> findByNameContainingOrEmailContaining(String name, String email);

    Page<User> findByStatus(AccountStatus status, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
            "(:status IS NULL OR u.status = :status) AND " +
            "(:role IS NULL OR u.role = :role) AND " +
            "(:position IS NULL OR u.position = :position) AND " +
            "(:keyword IS NULL OR u.name LIKE %:keyword% OR u.email LIKE %:keyword%)")
    Page<User> findByStatusAndRoleAndPositionAndKeyword(
            @Param("status") AccountStatus status,
            @Param("role") Role role,
            @Param("position") Position position,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByRole(Role role);

    long countByStatus(AccountStatus status);

    long countByPosition(Position position);

    default User findByIdOrThrow(Long userId) {
        return findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
    }

    default User findByEmailOrThrow(String email) {
        return findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
    }
}
