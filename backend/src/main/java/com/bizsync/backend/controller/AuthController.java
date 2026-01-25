package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.LoginRequestDTO;
import com.bizsync.backend.dto.request.PasswordChangeRequestDTO;
import com.bizsync.backend.dto.request.RefreshTokenRequest;
import com.bizsync.backend.dto.request.SignumRequestDTO;
import com.bizsync.backend.dto.response.ApiResponse;
import com.bizsync.backend.dto.response.JwtTokenResponse;
import com.bizsync.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증 관련 REST API 컨트롤러
 *
 * <p>회원가입, 로그인, 토큰 갱신, 비밀번호 변경 등의 API를 제공합니다.
 *
 * @author BizSync Team
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입을 처리합니다.
     *
     * @param dto 회원가입 요청 DTO
     * @return 생성된 사용자 ID
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Long>> signup(@Valid @RequestBody SignumRequestDTO dto) {
        Long userId = authService.signUp(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userId, "회원가입 성공"));
    }

    /**
     * 사용자 로그인을 처리합니다.
     *
     * @param dto 로그인 요청 DTO
     * @return JWT 토큰 응답
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtTokenResponse>> login(@Valid @RequestBody LoginRequestDTO dto) {
        JwtTokenResponse tokenResponse = authService.login(dto);
        return ResponseEntity.ok(ApiResponse.success(tokenResponse));
    }

    /**
     * 리프레시 토큰을 사용하여 새로운 토큰을 발급합니다.
     *
     * @param request 리프레시 토큰 요청
     * @return 새로운 JWT 토큰 응답
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtTokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        JwtTokenResponse tokenResponse = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(tokenResponse));
    }

    /**
     * 비밀번호를 변경합니다.
     *
     * @param dto 비밀번호 변경 요청 DTO
     * @return 성공 응답
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody PasswordChangeRequestDTO dto) {
        authService.changePassword(dto);
        return ResponseEntity.ok(ApiResponse.success("비밀번호가 변경되었습니다."));
    }
}
