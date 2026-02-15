package com.bizsync.backend.global.config;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka Topic 설정
 * 애플리케이션 시작 시 필요한 토픽을 자동으로 생성
 *
 * @author BizSync Team
 */
@Configuration
public class KafkaTopicConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    /**
     * Kafka Topic 이름 상수
     */
    public static final String NOTIFICATION_TOPIC = "bizsync.notification";
    public static final String ACTIVITY_LOG_TOPIC = "bizsync.activity-log";
    public static final String APPROVAL_TOPIC = "bizsync.approval";

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    /**
     * 알림 토픽
     * - 파티션 3개 (부하 분산)
     * - 복제 계수 1 (개발 환경)
     */
    @Bean
    public NewTopic notificationTopic() {
        return TopicBuilder.name(NOTIFICATION_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 활동 로그 토픽
     * - 파티션 3개
     * - 복제 계수 1
     */
    @Bean
    public NewTopic activityLogTopic() {
        return TopicBuilder.name(ACTIVITY_LOG_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    /**
     * 결재 토픽
     * - 파티션 2개 (결재는 상대적으로 빈도가 낮음)
     * - 복제 계수 1
     */
    @Bean
    public NewTopic approvalTopic() {
        return TopicBuilder.name(APPROVAL_TOPIC)
                .partitions(2)
                .replicas(1)
                .build();
    }
}
