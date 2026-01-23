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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Long>> signup(@Valid @RequestBody SignumRequestDTO dto) {
        Long userId = authService.signUp(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userId, "회원가입 성공"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtTokenResponse>> login(@Valid @RequestBody LoginRequestDTO dto) {
        JwtTokenResponse tokenResponse = authService.login(dto);
        return ResponseEntity.ok(ApiResponse.success(tokenResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtTokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        JwtTokenResponse tokenResponse = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(tokenResponse));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody PasswordChangeRequestDTO dto) {
        authService.changePassword(dto);
        return ResponseEntity.ok(ApiResponse.success("비밀번호가 변경되었습니다."));
    }
}
