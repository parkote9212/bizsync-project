package com.bizsync.backend.service;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증 및 사용자 인증 관련 비즈니스 로직을 처리하는 서비스
 * 
 * <p>회원가입, 로그인, 토큰 갱신, 비밀번호 변경 등의 기능을 제공합니다.
 * 
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    /**
     * 새로운 사용자를 등록합니다.
     * 
     * @param dto 회원가입 요청 DTO
     * @return 생성된 사용자 ID
     * @throws DuplicateException 이메일 또는 사원번호가 중복된 경우
     */
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

    /**
     * 사용자 로그인을 처리하고 JWT 토큰을 발급합니다.
     * 
     * @param dto 로그인 요청 DTO
     * @return JWT 토큰 응답 (액세스 토큰, 리프레시 토큰, 사용자 정보)
     * @throws BusinessException 비밀번호 불일치 또는 계정 상태 문제인 경우
     */
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

    /**
     * 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 발급합니다.
     * 
     * @param refreshToken 리프레시 토큰
     * @return 새로운 JWT 토큰 응답
     * @throws BusinessException 토큰이 유효하지 않거나 리프레시 토큰이 아닌 경우
     */
    @Transactional(readOnly = true)
    public JwtTokenResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        if (!jwtProvider.isRefreshToken(refreshToken)) {
            throw new BusinessException(ErrorCode.NOT_REFRESH_TOKEN);
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

    /**
     * 현재 로그인한 사용자의 비밀번호를 변경합니다.
     * 
     * @param dto 비밀번호 변경 요청 DTO
     * @throws BusinessException 현재 비밀번호가 일치하지 않거나 새 비밀번호가 현재와 동일한 경우
     */
    public void changePassword(PasswordChangeRequestDTO dto) {
        Long userId = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findByIdOrThrow(userId);

        if (!user.matchesPassword(dto.currentPassword(), passwordEncoder)) {
            throw new BusinessException(ErrorCode.USER_PASSWORD_MISMATCH);
        }

        if (dto.currentPassword().equals(dto.newPassword())) {
            throw new BusinessException(ErrorCode.USER_PASSWORD_SAME);
        }

        String encodedNewPassword = passwordEncoder.encode(dto.newPassword());
        user.changePassword(encodedNewPassword);

        log.info("비밀번호 변경 성공: userId={}", userId);
    }
}
