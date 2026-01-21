package com.bizsync.backend.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.security.access.prepost.PreAuthorize;

/**
 * 프로젝트 리더(PL) 권한을 요구하는 어노테이션
 * 메서드의 첫 번째 파라미터가 projectId여야 함
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("@projectSecurityService.isProjectLeader(#projectId)")
public @interface RequireProjectLeader {
}
