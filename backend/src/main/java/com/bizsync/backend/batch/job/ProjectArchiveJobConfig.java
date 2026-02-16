package com.bizsync.backend.batch.job;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.Executors;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.data.RepositoryItemReader;
import org.springframework.batch.item.data.builder.RepositoryItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.PlatformTransactionManager;

import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.project.entity.ProjectStatus;
import com.bizsync.backend.domain.project.repository.ProjectRepository;
import com.bizsync.backend.global.common.aop.PerformanceLogging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 프로젝트 아카이빙 배치 Job 설정
 *
 * <p>
 * 종료일이 지난 지 30일 이상 경과한 완료 프로젝트를 아카이빙합니다.
 * 상태 변경: COMPLETED → ARCHIVED
 *
 * <p>
 * 실행 스케줄: 매일 오전 2시 (Cron: 0 0 2 * * ?)
 *
 * <p>
 * 처리 전략:
 * <ul>
 * <li>청크 크기: 100건</li>
 * <li>리더(Reader): COMPLETED 이면서 종료일이 30일 이전인 프로젝트 조회</li>
 * <li>프로세서(Processor): 아카이빙 가능 여부 검증(필요 시 확장)</li>
 * <li>라이터(Writer): ARCHIVED로 상태 변경 후 저장</li>
 * </ul>
 *
 * @author BizSync Team
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class ProjectArchiveJobConfig {

    private static final int CHUNK_SIZE = 100;
    private static final int ARCHIVE_DAYS_THRESHOLD = 30;
    /** Step 병렬 처리 동시성 수준 (TaskExecutor 풀 크기로 제한) */
    private static final int STEP_CONCURRENCY = 10;
    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final ProjectRepository projectRepository;

    /**
     * 병렬 처리를 위한 Step 전용 TaskExecutor (동시성 제한)
     *
     * <p>
     * Spring Batch 5에서 deprecated된 throttleLimit 대신,
     * 풀 크기가 제한된 TaskExecutor로 동시성을 제어합니다.
     *
     * @return 고정 크기 스레드 풀 기반 TaskExecutor
     */
    @Bean
    public TaskExecutor projectArchiveTaskExecutor() {
        return new TaskExecutorAdapter(
                Executors.newFixedThreadPool(STEP_CONCURRENCY));
    }

    /**
     * 프로젝트 아카이빙 Job
     */
    @Bean
    public Job projectArchiveJob() {
        return new JobBuilder("projectArchiveJob", jobRepository)
                .start(projectArchiveStep())
                .build();
    }

    /**
     * 프로젝트 아카이빙 Step (병렬 처리)
     *
     * <p>
     * TaskExecutor 풀 크기(STEP_CONCURRENCY)로 동시성 수준을 제한합니다.
     */
    @Bean
    public Step projectArchiveStep() {
        return new StepBuilder("projectArchiveStep", jobRepository)
                .<Project, Project>chunk(CHUNK_SIZE, transactionManager)
                .reader(projectArchiveReader())
                .processor(projectArchiveProcessor())
                .writer(projectArchiveWriter())
                .taskExecutor(projectArchiveTaskExecutor())
                .build();
    }

    /**
     * Reader: 아카이빙 대상 프로젝트 조회
     *
     * <p>
     * 조건: COMPLETED 상태 + 종료일이 30일(이상) 이전
     */
    @Bean
    public RepositoryItemReader<Project> projectArchiveReader() {
        LocalDate cutoffDate = LocalDate.now().minusDays(ARCHIVE_DAYS_THRESHOLD);

        return new RepositoryItemReaderBuilder<Project>()
                .name("projectArchiveReader")
                .repository(projectRepository)
                .methodName("findByStatusAndEndDateBefore")
                .arguments(ProjectStatus.COMPLETED, cutoffDate)
                .sorts(Map.of("projectId", Sort.Direction.ASC))
                .pageSize(CHUNK_SIZE)
                .build();
    }

    /**
     * Processor: 아카이빙 대상 검증
     *
     * <p>
     * 현재는 그대로 통과(pass-through)하지만,
     * 필요 시 검증 로직을 추가할 수 있습니다.
     * (예: 연관 결재 문서 확인, 레퍼런스 정리 등)
     */
    @Bean
    public ItemProcessor<Project, Project> projectArchiveProcessor() {
        return project -> {
            log.debug("Processing project for archive: {} (ID: {})",
                    project.getName(), project.getProjectId());
            return project; // Pass through
        };
    }

    /**
     * Writer: ARCHIVED로 상태 변경 후 저장
     */
    @Bean
    @PerformanceLogging
    public ItemWriter<Project> projectArchiveWriter() {
        return chunk -> {
            int count = 0;
            for (Project project : chunk) {
                project.archive();
                projectRepository.save(project);
                count++;
                log.info("Archived project: {} (ID: {})",
                        project.getName(), project.getProjectId());
            }
            log.info("Archived {} projects in this chunk", count);
        };
    }
}
