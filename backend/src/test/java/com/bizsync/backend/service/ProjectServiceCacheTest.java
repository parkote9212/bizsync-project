package com.bizsync.backend.service;

import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.dto.request.ProjectCreateRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class ProjectServiceCacheTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private CacheManager cacheManager;

    private Long projectId;

    @BeforeEach
    void setUp() {
        // admin 사용자(1L)로 프로젝트 생성 (InitialDataLoader에서 생성됨)
        ProjectCreateRequestDTO dto = new ProjectCreateRequestDTO(
                "캐시 테스트 프로젝트",
                "캐시 동작 검증용",
                LocalDate.now(),
                LocalDate.now().plusMonths(1),
                new BigDecimal("1000000")
        );
        projectId = projectService.createProject(1L, dto);
    }

    @Test
    void testProjectCaching() {
        // When - 첫 번째 조회 (DB에서 가져옴)
        long startTime1 = System.currentTimeMillis();
        Project project1 = projectService.findById(projectId);
        long endTime1 = System.currentTimeMillis();

        // When - 두 번째 조회 (캐시에서 가져옴)
        long startTime2 = System.currentTimeMillis();
        Project project2 = projectService.findById(projectId);
        long endTime2 = System.currentTimeMillis();

        // Then
        assertThat(project1).isEqualTo(project2);
        assertThat(cacheManager.getCache("projects")).isNotNull();

        System.out.println("첫 번째 조회 시간: " + (endTime1 - startTime1) + "ms");
        System.out.println("두 번째 조회 시간 (캐시): " + (endTime2 - startTime2) + "ms");

        // 두 번째 조회가 더 빨라야 함 (캐시 히트)
        assertThat(endTime2 - startTime2).isLessThan(endTime1 - startTime1);
    }
}
