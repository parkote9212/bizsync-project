package com.bizsync.backend.common.config;

import com.bizsync.backend.common.util.SecurityUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

/**
 * JPA Auditing 설정
 * BaseEntity의 createdBy, updatedBy 필드에 현재 사용자 ID를 자동으로 설정
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<Long> auditorProvider() {
        return new AuditorAwareImpl();
    }

    /**
     * 현재 인증된 사용자 ID를 반환하는 AuditorAware 구현
     */
    static class AuditorAwareImpl implements AuditorAware<Long> {
        @Override
        public @org.springframework.lang.NonNull Optional<Long> getCurrentAuditor() {
            try {
                // SecurityUtil을 통해 현재 사용자 ID 조회
                // 인증되지 않은 경우 Optional.empty() 반환
                Long userId = SecurityUtil.getCurrentUserIdOrThrow();
                return Optional.of(userId);
            } catch (Exception e) {
                // 인증되지 않은 경우 (예: 시스템 초기화, 배치 작업 등)
                return Optional.empty();
            }
        }
    }
}
