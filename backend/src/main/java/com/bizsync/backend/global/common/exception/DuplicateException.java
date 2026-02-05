package com.bizsync.backend.global.common.exception;

/**
 * 중복 데이터가 발생했을 때 발생하는 예외
 * HTTP 409 (CONFLICT) 상태 코드로 매핑
 */
public class DuplicateException extends BusinessException {
    public DuplicateException(ErrorCode errorCode) {
        super(errorCode);
    }
}
