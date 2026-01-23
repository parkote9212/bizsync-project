package com.bizsync.backend.common.util;

import com.bizsync.backend.domain.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {

    // HS256 알고리즘의 경우 최소 256비트(32바이트)의 Secret이 필요
    private static final int MIN_SECRET_LENGTH_BYTES = 32;

    private final SecretKey secretKey;
    private final long expiration;
    private final long refreshExpiration;

    public JwtProvider(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.expiration-ms}") long expiration,
                       @Value("${app.jwt.refresh-expiration-ms}") long refreshExpiration) {
        // JWT Secret 검증: 최소 길이 확인
        validateSecret(secret);
        
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
        this.refreshExpiration = refreshExpiration;
    }

    /**
     * JWT Secret의 최소 길이를 검증
     * HS256 알고리즘은 최소 256비트(32바이트)의 Secret이 필요
     * 
     * @param secret 검증할 Secret 문자열
     * @throws IllegalArgumentException Secret이 너무 짧거나 null인 경우
     */
    private void validateSecret(String secret) {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "JWT Secret이 설정되지 않았습니다. 환경 변수 JWT_SECRET을 설정해주세요."
            );
        }

        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < MIN_SECRET_LENGTH_BYTES) {
            throw new IllegalArgumentException(
                    String.format(
                            "JWT Secret이 너무 짧습니다. 최소 %d바이트(256비트)가 필요합니다. " +
                            "현재 길이: %d바이트. 보안을 위해 충분히 긴 Secret을 사용해주세요.",
                            MIN_SECRET_LENGTH_BYTES,
                            secretBytes.length
                    )
            );
        }
    }

    /**
     * Access Token 생성
     */
    public String createToken(Long userId, Role role) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("role", role.name())
                .claim("type", "access")
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Refresh Token 생성
     */
    public String createRefreshToken(Long userId) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 토큰이 유효한지 검사 (만료 시간, 서명, 형식 모두 검증)
     */
    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // 만료 시간 검증
            Date expiration = claims.getExpiration();
            if (expiration == null || expiration.before(new Date())) {
                return false;
            }

            // 발행 시간 검증 (미래 시간이면 유효하지 않음)
            Date issuedAt = claims.getIssuedAt();
            if (issuedAt != null && issuedAt.after(new Date())) {
                return false;
            }

            // Subject(userId) 존재 여부 확인
            String subject = claims.getSubject();
            if (subject == null || subject.trim().isEmpty()) {
                return false;
            }

            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // 토큰 검증 실패 (만료, 변조, 잘못된 형식 등)
            return false;
        }
    }

    /**
     * Access Token인지 확인
     */
    public boolean isAccessToken(String token) {
        try {
            Claims claims = getClaims(token);
            String type = claims.get("type", String.class);
            return "access".equals(type);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Refresh Token인지 확인
     */
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = getClaims(token);
            String type = claims.get("type", String.class);
            return "refresh".equals(type);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 토큰에서 subject(userId)를 반환
     */
    public Long getUserId(String token) {
        Claims claims = getClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 토큰에서 role을 반환
     */
    public String getRole(String token) {
        Claims claims = getClaims(token);
        Object role = claims.get("role");
        return role == null ? null : role.toString();
    }

    /**
     * 토큰 만료 시간 반환
     */
    public Date getExpirationDate(String token) {
        Claims claims = getClaims(token);
        return claims.getExpiration();
    }

    /**
     * 토큰에서 Claims 추출
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
