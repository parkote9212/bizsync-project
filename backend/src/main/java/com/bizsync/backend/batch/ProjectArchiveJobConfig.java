package com.bizsync.backend.batch;

import com.bizsync.backend.common.aop.PerformanceLogging;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.ProjectStatus;
import com.bizsync.backend.domain.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.core.task.TaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;
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

import java.util.concurrent.Executors;

import java.time.LocalDate;
import java.util.Map;

/**
 * Project Archiving Batch Job Configuration
 * 
 * <p>Archives completed projects that have passed 30 days since end date.
 * Status change: COMPLETED → ARCHIVED
 * 
 * <p>Execution schedule: Daily at 2 AM (Cron: 0 0 2 * * ?)
 * 
 * <p>Processing strategy:
 * <ul>
 *   <li>Chunk size: 100 projects</li>
 *   <li>Reader: Query COMPLETED projects with end date > 30 days ago</li>
 *   <li>Processor: Validate archiving eligibility</li>
 *   <li>Writer: Change status to ARCHIVED and save</li>
 * </ul>
 * 
 * @author BizSync Team
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class ProjectArchiveJobConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final ProjectRepository projectRepository;

    private static final int CHUNK_SIZE = 100;
    private static final int ARCHIVE_DAYS_THRESHOLD = 30;
    private static final int VIRTUAL_THREAD_CONCURRENCY = 10;

    /**
     * Virtual Threads TaskExecutor for parallel processing
     * 
     * <p>Java 21 Virtual Threads enable lightweight concurrency.
     * Unlike Platform Threads (2MB each), Virtual Threads use only ~1KB.
     * 
     * @return TaskExecutor using Virtual Threads
     */
    @Bean
    public TaskExecutor virtualThreadTaskExecutor() {
        return new TaskExecutorAdapter(
            Executors.newVirtualThreadPerTaskExecutor()
        );
    }

    /**
     * Project Archiving Job
     */
    @Bean
    public Job projectArchiveJob() {
        return new JobBuilder("projectArchiveJob", jobRepository)
                .start(projectArchiveStep())
                .build();
    }

    /**
     * Project Archiving Step (with Virtual Threads)
     * 
     * <p>Processes projects in parallel using Virtual Threads.
     * Concurrency level: 10 (configurable)
     */
    @Bean
    public Step projectArchiveStep() {
        return new StepBuilder("projectArchiveStep", jobRepository)
                .<Project, Project>chunk(CHUNK_SIZE, transactionManager)
                .reader(projectArchiveReader())
                .processor(projectArchiveProcessor())
                .writer(projectArchiveWriter())
                .taskExecutor(virtualThreadTaskExecutor())
                .throttleLimit(VIRTUAL_THREAD_CONCURRENCY)
                .build();
    }

    /**
     * Reader: Query projects eligible for archiving
     * 
     * <p>Criteria: COMPLETED status & end date passed 30+ days ago
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
     * Processor: Validate archiving eligibility
     * 
     * <p>Currently passes through, but can add validation logic
     * (e.g., check related approval documents, cleanup references, etc.)
     */
    @Bean
    public ItemProcessor<Project, Project> projectArchiveProcessor() {
        return project -> {
            log.debug("Processing project for archive: {} (ID: {})", 
                    project.getName(), project.getProjectId());
            return project;  // Pass through
        };
    }

    /**
     * Writer: Change status to ARCHIVED and save
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
