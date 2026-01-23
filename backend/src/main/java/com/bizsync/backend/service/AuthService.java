package com.bizsync.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bizsync.backend.common.exception.BusinessException;
import com.bizsync.backend.common.exception.DuplicateException;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.util.JwtProvider;
import com.bizsync.backend.common.util.SecurityUtil;
import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.LoginRequestDTO;
import com.bizsync.backend.dto.request.PasswordChangeRequestDTO;
import com.bizsync.backend.dto.request.SignumRequestDTO;
import com.bizsync.backend.dto.response.JwtTokenResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public Long signUp(SignumRequestDTO dto) {
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new DuplicateException(ErrorCode.USER_EMAIL_DUPLICATE);
        }

        if (userRepository.existsByEmpNo(dto.empNo())) {
            throw new DuplicateException(ErrorCode.USER_EMPNO_DUPLICATE);
        }

        String encodedPassword = passwordEncoder.encode(dto.password());
        User savedUser = userRepository.save(dto.toEntity(encodedPassword));
        log.info("새로운 사용자 가입: userId={}, email={}", savedUser.getUserId(), savedUser.getEmail());

        return savedUser.getUserId();
    }

    @Transactional(readOnly = true)
    public JwtTokenResponse login(LoginRequestDTO dto) {
        User user = userRepository.findByEmailOrThrow(dto.email());

        if (!user.matchesPassword(dto.password(), passwordEncoder)) {
            throw new BusinessException(ErrorCode.USER_PASSWORD_MISMATCH);
        }

        if (user.getStatus() == AccountStatus.PENDING) {
            throw new BusinessException(ErrorCode.ACCOUNT_PENDING_APPROVAL);
        }

        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw new BusinessException(ErrorCode.ACCOUNT_SUSPENDED);
        }

        if (user.getStatus() == AccountStatus.DELETED) {
            throw new BusinessException(ErrorCode.ACCOUNT_DELETED);
        }

        String accessToken = jwtProvider.createToken(user.getUserId(), user.getRole());
        String refreshToken = jwtProvider.createRefreshToken(user.getUserId());

        log.info("사용자 로그인 성공: userId={}, email={}", user.getUserId(), user.getEmail());

        return JwtTokenResponse.of(
                accessToken,
                refreshToken,
                jwtProvider.getExpirationDate(accessToken),
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getPosition() != null ? user.getPosition().getKorean() : null,
                user.getDepartment()
        );
    }

    @Transactional(readOnly = true)
    public JwtTokenResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new com.bizsync.backend.common.exception.BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        if (!jwtProvider.isRefreshToken(refreshToken)) {
            throw new com.bizsync.backend.common.exception.BusinessException(ErrorCode.NOT_REFRESH_TOKEN);
        }

        Long userId = jwtProvider.getUserId(refreshToken);
        User user = userRepository.findByIdOrThrow(userId);

        String newAccessToken = jwtProvider.createToken(user.getUserId(), user.getRole());
        String newRefreshToken = jwtProvider.createRefreshToken(user.getUserId());

        log.info("토큰 갱신 성공: userId={}", userId);

        return JwtTokenResponse.of(
                newAccessToken,
                newRefreshToken,
                jwtProvider.getExpirationDate(newAccessToken),
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getPosition() != null ? user.getPosition().getKorean() : null,
                user.getDepartment()
        );
    }

    public void changePassword(PasswordChangeRequestDTO dto) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findByIdOrThrow(userId);

        if (!user.matchesPassword(dto.currentPassword(), passwordEncoder)) {
            throw new com.bizsync.backend.common.exception.BusinessException(ErrorCode.USER_PASSWORD_MISMATCH);
        }

        if (dto.currentPassword().equals(dto.newPassword())) {
            throw new com.bizsync.backend.common.exception.BusinessException(ErrorCode.USER_PASSWORD_SAME);
        }

        String encodedNewPassword = passwordEncoder.encode(dto.newPassword());
        user.changePassword(encodedNewPassword);

        log.info("비밀번호 변경 성공: userId={}", userId);
    }
}
