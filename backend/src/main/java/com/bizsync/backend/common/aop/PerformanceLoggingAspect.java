package com.bizsync.backend.common.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * {@link PerformanceLogging} Annotation이 붙은 메서드의 실행 시간을 측정하고 로깅하는 Aspect
 * 
 * <p>AOP(Aspect-Oriented Programming)를 사용하여 비즈니스 로직과 로깅 로직을 분리합니다.
 * 메서드 실행 전후에 자동으로 로그를 출력하고 실행 시간을 측정합니다.
 * 
 * <p>동작 방식:
 * <ol>
 *   <li>메서드 시작 시: 시작 로그 출력 및 시간 측정 시작</li>
 *   <li>메서드 실행: 실제 비즈니스 로직 수행</li>
 *   <li>메서드 종료 시: 종료 로그 및 소요 시간 출력</li>
 *   <li>예외 발생 시: 에러 로그 출력</li>
 * </ol>
 *
 * @author BizSync Team
 * @see PerformanceLogging
 */
@Slf4j
@Aspect
@Component
public class PerformanceLoggingAspect {

    /**
     * {@link PerformanceLogging} Annotation이 붙은 모든 메서드에 대해 실행 시간을 측정하고 로깅
     * 
     * @param joinPoint AOP가 가로챈 메서드 정보
     * @return 원본 메서드의 반환값
     * @throws Throwable 원본 메서드에서 발생한 예외
     */
    @Around("@annotation(PerformanceLogging)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        // 메서드 정보 추출
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String fullMethodName = className + "." + methodName;

        // 시작 로그
        log.info("[시작] {}", fullMethodName);
        
        // 시작 시간 측정
        long startTime = System.currentTimeMillis();
        
        Object result = null;
        try {
            // 실제 메서드 실행 ⭐
            result = joinPoint.proceed();
            
            // 종료 시간 측정
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            
            // 종료 로그 (성공)
            log.info("[완료] {} - 소요 시간: {}ms", fullMethodName, executionTime);
            
        } catch (Exception e) {
            // 종료 시간 측정 (실패)
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            
            // 에러 로그
            log.error("[실패] {} - 소요 시간: {}ms, 에러: {}", 
                    fullMethodName, executionTime, e.getMessage());
            
            // 예외 다시 던지기 (원래 동작 유지)
            throw e;
        }
        
        return result;
    }
}
