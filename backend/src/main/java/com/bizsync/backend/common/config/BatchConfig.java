package com.bizsync.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Spring Batch Configuration
 *
 * <p>Enables scheduling for batch jobs. Batch infrastructure (JobRepository, etc.)
 * is auto-configured by Spring Boot when spring-boot-starter-batch is on the classpath.
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
@EnableScheduling
public class BatchConfig {
    // JobRepository and PlatformTransactionManager are auto-configured by Spring Boot
}
