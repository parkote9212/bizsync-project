package com.bizsync.backend.domain.user.service;

import com.bizsync.backend.domain.user.dto.request.PasswordChangeRequestDTO;
import com.bizsync.backend.domain.user.dto.response.UserDetailResponseDTO;
import com.bizsync.backend.domain.user.entity.AccountStatus;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserOAuthRepository;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.global.common.exception.BusinessException;
import com.bizsync.backend.global.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 관리 서비스
 *
 * <p>사용자 정보 조회, 비밀번호 변경, OAuth 연동 해제, 회원 탈퇴 등을 처리합니다.
 *
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserOAuthRepository userOAuthRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 사용자 상세 정보를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 사용자 상세 정보 DTO
     */
    public UserDetailResponseDTO getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // OAuth 연동 여부 확인
        boolean hasOAuthLinked = userOAuthRepository.existsByUser_UserId(userId);

        UserDetailResponseDTO dto = UserDetailResponseDTO.from(user);
        // TODO: hasOAuthLinked 필드를 DTO에 추가하거나 별도로 반환

        return dto;
    }

    /**
     * 사용자의 비밀번호를 변경합니다.
     *
     * @param userId 사용자 ID
     * @param dto 비밀번호 변경 요청 DTO
     */
    @Transactional
    public void changePassword(Long userId, PasswordChangeRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 현재 비밀번호 확인
        if (!user.matchesPassword(dto.currentPassword(), passwordEncoder)) {
            throw new BusinessException(ErrorCode.USER_PASSWORD_MISMATCH);
        }

        // 새 비밀번호 암호화 및 저장
        String encodedPassword = passwordEncoder.encode(dto.newPassword());
        user.changePassword(encodedPassword);

        log.info("비밀번호 변경 완료: userId={}", userId);
    }

    /**
     * OAuth 연동을 해제합니다.
     *
     * @param userId 사용자 ID
     */
    @Transactional
    public void unlinkOAuth(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // OAuth 연동 정보 삭제
        int deletedCount = userOAuthRepository.deleteByUser_UserId(userId);

        if (deletedCount == 0) {
            throw new BusinessException(ErrorCode.OAUTH_NOT_LINKED);
        }

        log.info("OAuth 연동 해제 완료: userId={}, deletedCount={}", userId, deletedCount);
    }

    /**
     * 사용자 계정을 탈퇴 처리합니다.
     * 실제 삭제 대신 상태를 DELETED로 변경합니다.
     *
     * @param userId 사용자 ID
     */
    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 계정 상태를 DELETED로 변경 (Soft Delete)
        user.reject(); // DELETED 상태로 변경

        // OAuth 연동 정보도 삭제
        userOAuthRepository.deleteByUser_UserId(userId);

        log.info("회원 탈퇴 완료: userId={}", userId);
    }
}
