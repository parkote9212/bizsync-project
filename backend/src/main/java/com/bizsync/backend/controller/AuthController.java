package com.bizsync.backend.controller;

import com.bizsync.backend.dto.request.LoginRequestDTO;
import com.bizsync.backend.dto.request.PasswordChangeRequestDTO;
import com.bizsync.backend.dto.request.RefreshTokenRequest;
import com.bizsync.backend.dto.request.SignumRequestDTO;
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

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignumRequestDTO dto) {
        Long userId = authService.signUp(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "회원가입 성공",
                        "userId", userId
                ));
    }

    /**
     * 로그인 - Access Token과 Refresh Token 발급
     */
    @PostMapping("/login")
    public ResponseEntity<JwtTokenResponse> login(@Valid @RequestBody LoginRequestDTO dto) {
        JwtTokenResponse tokenResponse = authService.login(dto);
        return ResponseEntity.ok(tokenResponse);
    }

    /**
     * 토큰 갱신 - Refresh Token으로 새로운 Access Token 발급
     */
    @PostMapping("/refresh")
    public ResponseEntity<JwtTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        JwtTokenResponse tokenResponse = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(tokenResponse);
    }

    /**
     * 비밀번호 변경
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody PasswordChangeRequestDTO dto) {
        authService.changePassword(dto);
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
    }
}
