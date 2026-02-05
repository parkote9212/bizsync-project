package com.bizsync.backend.global.config;

import com.bizsync.backend.global.common.util.SecurityUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<Long> auditorProvider() {
        return new AuditorAwareImpl();
    }

    static class AuditorAwareImpl implements AuditorAware<Long> {
        @Override
        public @org.springframework.lang.NonNull Optional<Long> getCurrentAuditor() {
            try {
                Long userId = SecurityUtil.getCurrentUserIdOrThrow();
                return Optional.of(userId);
            } catch (Exception e) {
                return Optional.empty();
            }
        }
    }
}
