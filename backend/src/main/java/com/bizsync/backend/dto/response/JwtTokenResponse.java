package com.bizsync.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * JWT 토큰 응답 DTO
 * Access Token과 Refresh Token을 함께 반환
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtTokenResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;  // "Bearer"
    private Long expiresIn;    // Access Token 만료까지 남은 시간 (초)
    private Long userId;
    private String name;
    private String email;
    private String role;

    /**
     * Bearer 토큰 형식으로 생성
     */
    public static JwtTokenResponse of(String accessToken, String refreshToken, Date expirationDate, Long userId, String name, String email, String role) {
        long expiresIn = (expirationDate.getTime() - System.currentTimeMillis()) / 1000;

        return JwtTokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .userId(userId)
                .name(name)
                .email(email)
                .role(role)
                .build();
    }
}
