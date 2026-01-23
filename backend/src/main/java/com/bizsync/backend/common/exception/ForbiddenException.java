package com.bizsync.backend.common.exception;

/**
 * 권한이 없을 때 발생하는 예외
 * HTTP 403 (FORBIDDEN) 상태 코드로 매핑
 */
public class ForbiddenException extends BusinessException {
    public ForbiddenException(ErrorCode errorCode) {
        super(errorCode);
    }
}
