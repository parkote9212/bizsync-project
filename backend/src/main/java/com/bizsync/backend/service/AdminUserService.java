package com.bizsync.backend.service;

import com.bizsync.backend.common.exception.BusinessException;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.PasswordResetRequestDTO;
import com.bizsync.backend.dto.request.UserRoleUpdateRequestDTO;
import com.bizsync.backend.dto.response.AdminUserStatisticsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<User> getUserList(AccountStatus status, Role role, String keyword, Pageable pageable) {
        return userRepository.findByStatusAndRoleAndKeyword(status, role, keyword, pageable);
    }

    @Transactional(readOnly = true)
    public User getUserDetail(Long userId) {
        return userRepository.findByIdOrThrow(userId);
    }

    public void approveUser(Long userId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
        if (currentUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_MODIFY_SELF);
        }

        User user = userRepository.findByIdOrThrow(userId);
        if (user.getStatus() == AccountStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_ALREADY_ACTIVE);
        }
        user.approve();
        log.info("사용자 승인: userId={}, email={}", userId, user.getEmail());
    }

    public void rejectUser(Long userId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
        if (currentUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_MODIFY_SELF);
        }

        User user = userRepository.findByIdOrThrow(userId);
        user.reject();
        log.info("사용자 거부: userId={}, email={}", userId, user.getEmail());
    }

    public void suspendUser(Long userId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
        if (currentUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_MODIFY_SELF);
        }

        User user = userRepository.findByIdOrThrow(userId);
        user.suspend();
        log.info("사용자 정지: userId={}, email={}", userId, user.getEmail());
    }

    public void activateUser(Long userId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
        if (currentUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_MODIFY_SELF);
        }

        User user = userRepository.findByIdOrThrow(userId);
        user.activate();
        log.info("사용자 활성화: userId={}, email={}", userId, user.getEmail());
    }

    public void changeUserRole(Long userId, UserRoleUpdateRequestDTO dto) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
        if (currentUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_MODIFY_SELF);
        }

        User user = userRepository.findByIdOrThrow(userId);
        user.changeRole(dto.role());
        log.info("사용자 권한 변경: userId={}, newRole={}", userId, dto.role());
    }

    public void resetPassword(Long userId, PasswordResetRequestDTO dto) {
        User user = userRepository.findByIdOrThrow(userId);
        String encodedPassword = passwordEncoder.encode(dto.newPassword());
        user.resetPassword(encodedPassword);
        log.info("비밀번호 재설정: userId={}", userId);
    }

    public void deleteUser(Long userId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
        if (currentUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_MODIFY_SELF);
        }

        User user = userRepository.findByIdOrThrow(userId);
        userRepository.delete(user);
        log.info("사용자 삭제: userId={}, email={}", userId, user.getEmail());
    }

    @Transactional(readOnly = true)
    public AdminUserStatisticsDTO getStatistics() {
        long totalUsers = userRepository.count();
        long pendingUsers = userRepository.countByStatus(AccountStatus.PENDING);
        long activeUsers = userRepository.countByStatus(AccountStatus.ACTIVE);
        long suspendedUsers = userRepository.countByStatus(AccountStatus.SUSPENDED);
        long deletedUsers = userRepository.countByStatus(AccountStatus.DELETED);
        long adminUsers = userRepository.countByRole(Role.ADMIN);
        long managerUsers = userRepository.countByRole(Role.MANAGER);
        long memberUsers = userRepository.countByRole(Role.MEMBER);

        return new AdminUserStatisticsDTO(
                totalUsers,
                pendingUsers,
                activeUsers,
                suspendedUsers,
                deletedUsers,
                adminUsers,
                managerUsers,
                memberUsers
        );
    }
}
