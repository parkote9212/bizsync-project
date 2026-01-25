package com.bizsync.backend.common.exception;

/**
 * 인증되지 않은 접근 시 사용 (SecurityUtil 등).
 * GlobalExceptionHandler에서 401 UNAUTHORIZED로 매핑.
 */
public class UnauthenticatedException extends RuntimeException {
    private final ErrorCode errorCode;

    public UnauthenticatedException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public UnauthenticatedException(String message) {
        super(message);
        this.errorCode = ErrorCode.UNAUTHENTICATED;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
