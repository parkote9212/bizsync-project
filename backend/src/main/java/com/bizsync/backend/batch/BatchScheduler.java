package com.bizsync.backend.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Batch Job Scheduler
 * 
 * <p>Automatically executes batch jobs at scheduled times.
 * 
 * @author BizSync Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job projectArchiveJob;

    /**
     * Execute project archiving batch job
     * 
     * <p>Schedule: Daily at 2 AM KST (Cron: 0 0 2 * * ?)
     */
    @Scheduled(cron = "0 0 2 * * ?", zone = "Asia/Seoul")
    public void runProjectArchiveJob() {
        try {
            log.info("[Batch Scheduler] Starting Project Archive Job");
            
            // JobParameters must be unique for each execution
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();
            
            jobLauncher.run(projectArchiveJob, jobParameters);
            
            log.info("[Batch Scheduler] Project Archive Job completed successfully");
        } catch (Exception e) {
            log.error("[Batch Scheduler] Project Archive Job failed", e);
        }
    }
}
