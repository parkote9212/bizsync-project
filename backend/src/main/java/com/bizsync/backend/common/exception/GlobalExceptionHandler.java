package com.bizsync.backend.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 비즈니스 예외 처리 (기본).
     * <p>결재 락 타임아웃(APPROVAL_LOCK_TIMEOUT), 락 인터럽트(APPROVAL_LOCK_INTERRUPTED) 등
     * Redisson Lock 관련 예외도 이 핸들러에서 처리됩니다.
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        ErrorCode errorCode = e.getErrorCode();
        log.warn("Business exception: {} - {}", errorCode.name(), e.getMessage());
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(new ErrorResponse(
                        errorCode.name(),
                        errorCode.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * 리소스를 찾을 수 없음 (404)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException e) {
        ErrorCode errorCode = e.getErrorCode();
        log.warn("Resource not found: {} - {}", errorCode.name(), e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        errorCode.name(),
                        errorCode.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * 권한 없음 (403)
     */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException e) {
        ErrorCode errorCode = e.getErrorCode();
        log.warn("Forbidden: {} - {}", errorCode.name(), e.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        errorCode.name(),
                        errorCode.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * 중복 데이터 (409)
     */
    @ExceptionHandler(DuplicateException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateException e) {
        ErrorCode errorCode = e.getErrorCode();
        log.warn("Duplicate: {} - {}", errorCode.name(), e.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        errorCode.name(),
                        errorCode.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * 인증 실패 (401)
     */
    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthenticated(UnauthenticatedException e) {
        log.warn("Unauthorized: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        "UNAUTHORIZED",
                        e.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * 잘못된 인자 (IllegalArgumentException) - 하위 호환성을 위해 유지
     * 가능한 경우 BusinessException으로 마이그레이션 권장
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        log.warn("Illegal argument: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "BAD_REQUEST",
                        e.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * 잘못된 상태 (IllegalStateException) - 하위 호환성을 위해 유지
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException e) {
        log.warn("Illegal state: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "BAD_REQUEST",
                        e.getMessage(),
                        LocalDateTime.now()
                ));
    }

    /**
     * 유효성 검증 실패
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // 첫 번째 에러 메시지만 대표로 보냄
        String firstErrorMessage = errors.values().stream()
                .findFirst()
                .orElse("입력값이 올바르지 않습니다.");

        log.warn("Validation error: {}", firstErrorMessage);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "VALIDATION_ERROR",
                        firstErrorMessage,
                        LocalDateTime.now()
                ));
    }

    /**
     * 기타 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Unhandled exception occurred", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        "SERVER_ERROR",
                        "서버 내부 오류가 발생했습니다.",
                        LocalDateTime.now()
                ));
    }

    /**
     * 에러 응답 DTO
     */
    public record ErrorResponse(String code, String message, LocalDateTime timestamp) {
    }
}
