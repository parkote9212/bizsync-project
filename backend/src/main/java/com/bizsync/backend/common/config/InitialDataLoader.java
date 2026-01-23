package com.bizsync.backend.common.config;

import com.bizsync.backend.domain.entity.AccountStatus;
import com.bizsync.backend.domain.entity.Position;
import com.bizsync.backend.domain.entity.Role;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InitialDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Value("${admin.email:admin@bizsync.com}")
    private String adminEmail;

    @Value("${admin.password:Admin123!@#}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            String encodedPassword = passwordEncoder.encode(adminPassword);
            
            User admin = User.builder()
                    .email(adminEmail)
                    .password(encodedPassword)
                    .name("시스템 관리자")
                    .department("시스템")
                    .position(Position.EXECUTIVE)
                    .role(Role.ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .build();

            userRepository.save(admin);
            
            String[] activeProfiles = environment.getActiveProfiles();
            boolean isProduction = false;
            for (String profile : activeProfiles) {
                if ("prod".equals(profile) || "production".equals(profile)) {
                    isProduction = true;
                    break;
                }
            }
            
            if (isProduction) {
                log.error("========================================");
                log.error("⚠️ 프로덕션 환경 초기 관리자 생성됨!");
                log.error("⚠️ 즉시 로그인하여 비밀번호를 변경하세요!");
                log.error("⚠️ 이메일: {}", adminEmail);
                log.error("========================================");
            } else {
                log.warn("개발 환경 관리자 계정: {} / {}", adminEmail, adminPassword);
            }
        } else {
            log.info("초기 관리자 계정이 이미 존재합니다.");
        }
    }
}
