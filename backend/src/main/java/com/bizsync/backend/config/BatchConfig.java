package com.bizsync.backend.config;

import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Spring Batch Configuration
 * 
 * <p>Enables batch processing and scheduling.
 * 
 * <p>Main batch jobs:
 * <ul>
 *   <li>Project archiving (Daily at 2 AM)</li>
 *   <li>Monthly statistics aggregation (1st of every month)</li>
 * </ul>
 * 
 * @author BizSync Team
 */
@Configuration
@EnableBatchProcessing
@EnableScheduling
public class BatchConfig {
    // JobRepository and PlatformTransactionManager are auto-configured by Spring Boot
}
