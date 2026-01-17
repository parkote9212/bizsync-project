package com.bizsync.backend.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Spring Security Context에서 현재 인증된 사용자 정보를 조회하는 유틸리티 클래스
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class SecurityUtil {

    /**
     * 현재 인증된 사용자의 ID를 반환
     *
     * @return 인증된 사용자 ID, 인증되지 않은 경우 Optional.empty()
     */
    public static Optional<Long> getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated() ||
                    "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.empty();
            }

            String userId = (String) authentication.getPrincipal();
            return Optional.of(Long.parseLong(userId));
        } catch (Exception e) {
            log.error("Failed to get current user ID: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 현재 인증된 사용자의 ID를 반환 (인증되지 않은 경우 예외 발생)
     *
     * @return 인증된 사용자 ID
     * @throws IllegalStateException 인증되지 않은 경우
     */
    public static Long getCurrentUserIdOrThrow() {
        return getCurrentUserId()
                .orElseThrow(() -> new IllegalStateException("인증된 사용자가 없습니다."));
    }

    /**
     * 현재 요청이 인증되었는지 확인
     *
     * @return 인증 여부
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null &&
                authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal());
    }

    /**
     * 현재 인증된 사용자가 특정 권한을 가지고 있는지 확인
     *
     * @param role 확인할 권한 (예: "USER", "ADMIN")
     * @return 권한 보유 여부
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        String roleWithPrefix = "ROLE_" + role;
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(roleWithPrefix));
    }
}
