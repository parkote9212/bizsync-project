package com.bizsync.backend.global.common.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class PerformanceLoggingAspect {

    @Around("@annotation(com.bizsync.backend.global.common.aop.PerformanceLogging)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String fullMethodName = className + "." + methodName;

        log.info("[시작] {}", fullMethodName);
        long startTime = System.currentTimeMillis();
        Object result = null;
        try {
            result = joinPoint.proceed();
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            log.info("[완료] {} - 소요 시간: {}ms", fullMethodName, executionTime);
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            log.error("[실패] {} - 소요 시간: {}ms, 에러: {}",
                    fullMethodName, executionTime, e.getMessage());
            throw e;
        }
        return result;
    }
}
