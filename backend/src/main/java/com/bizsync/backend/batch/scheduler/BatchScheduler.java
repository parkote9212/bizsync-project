package com.bizsync.backend.batch.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 배치 작업 스케줄러
 *
 * <p>설정된 스케줄에 따라 배치 작업을 자동 실행합니다.
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
     * 프로젝트 아카이빙 배치 작업 실행
     *
     * <p>스케줄: 매일 오전 2시(KST) 실행 (Cron: 0 0 2 * * ?)
     */
    @Scheduled(cron = "0 0 2 * * ?", zone = "Asia/Seoul")
    public void runProjectArchiveJob() {
        try {
            log.info("[Batch Scheduler] Starting Project Archive Job");

            // JobParameters는 실행마다 유니크해야 합니다.
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
