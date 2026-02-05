package com.bizsync.backend.common.aop;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 메서드 실행 시간을 측정하고 로깅하는 Annotation
 * 
 * <p>이 Annotation을 메서드에 추가하면 자동으로:
 * <ul>
 *   <li>메서드 시작 시 로그 출력</li>
 *   <li>실행 시간 측정</li>
 *   <li>메서드 종료 시 소요 시간 로그 출력</li>
 * </ul>
 * 
 * <p>사용 예시:
 * <pre>
 * {@code
 * @PerformanceLogging
 * public void sendBulkNotification(List<Long> userIds, String message, Long targetId) {
 *     // 비즈니스 로직
 * }
 * }
 * </pre>
 * 
 * <p>출력 예시:
 * <pre>
 * [시작] NotificationService.sendBulkNotification
 * [완료] NotificationService.sendBulkNotification - 소요 시간: 45ms
 * </pre>
 *
 * @author BizSync Team
 * @see PerformanceLoggingAspect
 */
@Target(ElementType.METHOD)  // 메서드에만 사용 가능
@Retention(RetentionPolicy.RUNTIME)  // 런타임에 동작
public @interface PerformanceLogging {
}
