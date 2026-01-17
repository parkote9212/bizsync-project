package com.bizsync.backend.service;

import com.bizsync.backend.common.util.JwtProvider;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.LoginRequestDTO;
import com.bizsync.backend.dto.request.SignumRequestDTO;
import com.bizsync.backend.dto.response.JwtTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    /**
     * 회원가입
     */
    public Long signUp(SignumRequestDTO dto) {
        // 이메일 중복 체크
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        // 사번 중복 체크
        if (userRepository.existsByEmpNo(dto.empNo())) {
            throw new IllegalArgumentException("이미 존재하는 사번입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(dto.password());

        // 사용자 저장
        User savedUser = userRepository.save(dto.toEntity(encodedPassword));
        log.info("새로운 사용자 가입: userId={}, email={}", savedUser.getUserId(), savedUser.getEmail());

        return savedUser.getUserId();
    }

    /**
     * 로그인 - Access Token과 Refresh Token 발급
     */
    @Transactional(readOnly = true)
    public JwtTokenResponse login(LoginRequestDTO dto) {
        // 사용자 조회
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // Access Token 생성
        String accessToken = jwtProvider.createToken(user.getUserId(), user.getRole());

        // Refresh Token 생성
        String refreshToken = jwtProvider.createRefreshToken(user.getUserId());

        log.info("사용자 로그인 성공: userId={}, email={}", user.getUserId(), user.getEmail());

        // 토큰 응답 생성
        return JwtTokenResponse.of(
                accessToken,
                refreshToken,
                jwtProvider.getExpirationDate(accessToken),
                user.getUserId(),
                user.getRole().name()
        );
    }

    /**
     * Refresh Token으로 Access Token 재발급
     */
    @Transactional(readOnly = true)
    public JwtTokenResponse refresh(String refreshToken) {
        // Refresh Token 검증
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
        }

        // Refresh Token인지 확인
        if (!jwtProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Refresh Token이 아닙니다.");
        }

        // 사용자 정보 조회
        Long userId = jwtProvider.getUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 새로운 Access Token 생성
        String newAccessToken = jwtProvider.createToken(user.getUserId(), user.getRole());

        // 새로운 Refresh Token 생성 (Refresh Token Rotation)
        String newRefreshToken = jwtProvider.createRefreshToken(user.getUserId());

        log.info("토큰 갱신 성공: userId={}", userId);

        return JwtTokenResponse.of(
                newAccessToken,
                newRefreshToken,
                jwtProvider.getExpirationDate(newAccessToken),
                user.getUserId(),
                user.getRole().name()
        );
    }
}
