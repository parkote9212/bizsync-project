package com.bizsync.backend.service;

import com.bizsync.backend.common.exception.BusinessException;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.Position;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.PasswordResetRequestDTO;
import com.bizsync.backend.dto.request.UserPositionUpdateRequestDTO;
import com.bizsync.backend.dto.request.UserRoleUpdateRequestDTO;
import com.bizsync.backend.dto.response.AdminUserStatisticsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자용 사용자 관리 비즈니스 로직을 처리하는 서비스
 *
 * <p>사용자 목록 조회, 승인/거부, 정지/활성화, 권한 변경, 비밀번호 재설정 등의 기능을 제공합니다.
 *
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 자기 자신인지 확인하고 예외를 발생시킵니다.
     *
     * @param userId 확인할 사용자 ID
     * @throws BusinessException 자기 자신을 수정하려는 경우
     */
    private void validateNotSelf(Long userId) {
        Long currentUserId = SecurityUtil.getCurrentUserIdOrThrow();
        if (currentUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.ADMIN_CANNOT_MODIFY_SELF);
        }
    }

    /**
     * 사용자 목록을 조회합니다 (필터링 및 검색 지원).
     *
     * @param status   계정 상태 필터 (null이면 전체)
     * @param role     사용자 권한 필터 (null이면 전체)
     * @param position 사용자 직급 필터 (null이면 전체)
     * @param keyword  검색 키워드 (이름, 이메일 검색)
     * @param pageable 페이지 정보
     * @return 사용자 목록 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<User> getUserList(AccountStatus status, Role role, Position position, String keyword, Pageable pageable) {
        return userRepository.findByStatusAndRoleAndPositionAndKeyword(status, role, position, keyword, pageable);
    }

    /**
     * 사용자 상세 정보를 조회합니다.
     *
     * @param userId 조회할 사용자 ID
     * @return 사용자 엔티티
     */
    @Transactional(readOnly = true)
    public User getUserDetail(Long userId) {
        return userRepository.findByIdOrThrow(userId);
    }

    /**
     * 사용자 계정을 승인합니다.
     *
     * @param userId 승인할 사용자 ID
     * @throws BusinessException 자기 자신을 수정하려는 경우 또는 이미 활성화된 계정인 경우
     */
    public void approveUser(Long userId) {
        validateNotSelf(userId);

        User user = userRepository.findByIdOrThrow(userId);
        if (user.getStatus() == AccountStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_ALREADY_ACTIVE);
        }
        user.approve();
        log.info("사용자 승인: userId={}, email={}", userId, user.getEmail());
    }

    /**
     * 사용자 계정을 거부합니다.
     *
     * @param userId 거부할 사용자 ID
     * @throws BusinessException 자기 자신을 수정하려는 경우
     */
    public void rejectUser(Long userId) {
        validateNotSelf(userId);

        User user = userRepository.findByIdOrThrow(userId);
        user.reject();
        log.info("사용자 거부: userId={}, email={}", userId, user.getEmail());
    }

    /**
     * 사용자 계정을 정지합니다.
     *
     * @param userId 정지할 사용자 ID
     * @throws BusinessException 자기 자신을 수정하려는 경우
     */
    public void suspendUser(Long userId) {
        validateNotSelf(userId);

        User user = userRepository.findByIdOrThrow(userId);
        user.suspend();
        log.info("사용자 정지: userId={}, email={}", userId, user.getEmail());
    }

    /**
     * 사용자 계정을 활성화합니다.
     *
     * @param userId 활성화할 사용자 ID
     * @throws BusinessException 자기 자신을 수정하려는 경우
     */
    public void activateUser(Long userId) {
        validateNotSelf(userId);

        User user = userRepository.findByIdOrThrow(userId);
        user.activate();
        log.info("사용자 활성화: userId={}, email={}", userId, user.getEmail());
    }

    /**
     * 사용자 권한을 변경합니다.
     *
     * @param userId 사용자 ID
     * @param dto    권한 변경 요청 DTO
     * @throws BusinessException 자기 자신을 수정하려는 경우
     */
    @CacheEvict(value = "userPermissions", key = "#userId")
    public void changeUserRole(Long userId, UserRoleUpdateRequestDTO dto) {
        validateNotSelf(userId);

        User user = userRepository.findByIdOrThrow(userId);
        user.changeRole(dto.role());
        log.info("사용자 권한 변경: userId={}, newRole={}", userId, dto.role());
    }

    /**
     * 사용자 직급을 변경합니다.
     *
     * @param userId 사용자 ID
     * @param dto    직급 변경 요청 DTO
     */
    public void changeUserPosition(Long userId, UserPositionUpdateRequestDTO dto) {
        User user = userRepository.findByIdOrThrow(userId);
        user.changePosition(dto.position());
        log.info("사용자 직급 변경: userId={}, newPosition={}", userId, dto.position());
    }

    /**
     * 사용자 비밀번호를 재설정합니다.
     *
     * @param userId 사용자 ID
     * @param dto    비밀번호 재설정 요청 DTO
     */
    public void resetPassword(Long userId, PasswordResetRequestDTO dto) {
        User user = userRepository.findByIdOrThrow(userId);
        String encodedPassword = passwordEncoder.encode(dto.newPassword());
        user.resetPassword(encodedPassword);
        log.info("비밀번호 재설정: userId={}", userId);
    }

    /**
     * 사용자를 삭제합니다 (소프트 삭제 - 상태를 DELETED로 변경).
     *
     * @param userId 삭제할 사용자 ID
     * @throws BusinessException 자기 자신을 삭제하려는 경우
     */
    public void deleteUser(Long userId) {
        validateNotSelf(userId);

        User user = userRepository.findByIdOrThrow(userId);
        user.reject(); // 상태를 DELETED로 변경 (소프트 삭제)
        log.info("사용자 삭제 (소프트 삭제): userId={}, email={}", userId, user.getEmail());
    }

    /**
     * 사용자 통계 정보를 조회합니다.
     *
     * @return 사용자 통계 DTO
     */
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

        return AdminUserStatisticsDTO.from(
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
