package com.bizsync.backend.common.filter;

import com.bizsync.backend.common.util.JwtProvider;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            // Authorization 헤더에서 토큰 추출
            String token = extractToken(request);
            
            // 토큰이 있고 유효한 경우
            if (StringUtils.hasText(token) && jwtProvider.validateToken(token)) {
                // Access Token인지 확인
                if (jwtProvider.isAccessToken(token)) {
                    authenticateUser(token);
                } else {
                    log.warn("Refresh token used for authentication attempt");
                }
            }
        } catch (Exception e) {
            log.error("JWT Authentication failed: {}", e.getMessage());
            // 인증 실패 시 SecurityContext를 초기화
            SecurityContextHolder.clearContext();
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * Request에서 JWT 토큰 추출
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * 사용자 인증 처리
     */
    private void authenticateUser(String token) {
        Long userId = jwtProvider.getUserId(token);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String role = jwtProvider.getRole(token);
            
            // 권한 설정 (ROLE_ prefix 추가)
            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + (role != null ? role : user.getRole().name()))
            );
            
            // 인증 객체 생성 및 SecurityContext에 설정
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    String.valueOf(userId), 
                    null, 
                    authorities
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            
            log.debug("User {} authenticated successfully with role {}", userId, role);
        } else {
            log.warn("User {} not found in database", userId);
        }
    }
}
