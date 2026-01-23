package com.bizsync.backend.common.exception;

/**
 * 리소스를 찾을 수 없을 때 발생하는 예외
 * HTTP 404 (NOT_FOUND) 상태 코드로 매핑
 */
public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
