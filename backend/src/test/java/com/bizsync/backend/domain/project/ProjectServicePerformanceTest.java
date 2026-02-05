package com.bizsync.backend.domain.project;

import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.project.service.ProjectService;
import com.bizsync.backend.domain.project.dto.request.ProjectCreateRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class ProjectServicePerformanceTest {

    @Autowired
    private ProjectService projectService;

    private Long projectId;

    @BeforeEach
    void setUp() {
        ProjectCreateRequestDTO dto = new ProjectCreateRequestDTO(
                "성능 테스트 프로젝트",
                "성능 측정용",
                LocalDate.now(),
                LocalDate.now().plusMonths(1),
                new BigDecimal("1000000")
        );
        projectId = projectService.createProject(1L, dto);
    }

    @Test
    void measureProjectFindByIdPerformance() {
        // 워밍업 (JVM 최적화)
        for (int i = 0; i < 10; i++) {
            projectService.findById(projectId);
        }

        // 실제 측정 (10회 평균)
        long totalTime = 0;
        int iterations = 10;

        for (int i = 0; i < iterations; i++) {
            long start = System.nanoTime();
            Project project = projectService.findById(projectId);
            long end = System.nanoTime();

            totalTime += (end - start);
        }

        double averageMs = (totalTime / iterations) / 1_000_000.0;

        System.out.println("===========================================");
        System.out.println("📊 BEFORE (캐싱 적용 전) 성능 측정 결과");
        System.out.println("===========================================");
        System.out.println("평균 응답 시간: " + String.format("%.2f", averageMs) + "ms");
        System.out.println("측정 횟수: " + iterations + "회");
        System.out.println("===========================================");

        // 이 값을 PERFORMANCE_METRICS.md에 기록하세요!
    }
}
