package com.bizsync.backend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    USER_EMAIL_DUPLICATE(HttpStatus.CONFLICT, "이미 존재하는 이메일입니다."),
    USER_EMPNO_DUPLICATE(HttpStatus.CONFLICT, "이미 존재하는 사번입니다."),
    USER_PASSWORD_MISMATCH(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),
    USER_PASSWORD_SAME(HttpStatus.BAD_REQUEST, "새 비밀번호는 현재 비밀번호와 달라야 합니다."),
    ACCOUNT_PENDING_APPROVAL(HttpStatus.FORBIDDEN, "계정 승인 대기 중입니다. 관리자 승인 후 로그인할 수 있습니다."),
    ACCOUNT_SUSPENDED(HttpStatus.FORBIDDEN, "정지된 계정입니다."),
    ACCOUNT_DELETED(HttpStatus.FORBIDDEN, "삭제된 계정입니다."),
    ACCOUNT_ALREADY_ACTIVE(HttpStatus.BAD_REQUEST, "이미 활성화된 계정입니다."),
    ADMIN_CANNOT_MODIFY_SELF(HttpStatus.BAD_REQUEST, "관리자는 자신의 계정을 수정할 수 없습니다."),

    // Project
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "프로젝트를 찾을 수 없습니다."),
    PROJECT_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "프로젝트 멤버가 아닙니다."),
    PROJECT_MEMBER_NOT_FOUND_BY_ID(HttpStatus.NOT_FOUND, "해당 멤버를 찾을 수 없습니다."),
    PROJECT_PERMISSION_DENIED(HttpStatus.FORBIDDEN, "프로젝트 권한이 없습니다."),
    PROJECT_ALREADY_MEMBER(HttpStatus.CONFLICT, "이미 프로젝트의 멤버입니다."),
    PROJECT_LEADER_CANNOT_CHANGE_SELF(HttpStatus.BAD_REQUEST, "자기 자신의 권한은 변경할 수 없습니다."),
    PROJECT_LEADER_CANNOT_REMOVE_SELF(HttpStatus.BAD_REQUEST, "프로젝트 리더는 스스로를 삭제할 수 없습니다."),
    PROJECT_LEADER_ONLY(HttpStatus.FORBIDDEN, "프로젝트 리더(PL)만 수행할 수 있는 작업입니다."),
    PROJECT_NOT_LINKED(HttpStatus.BAD_REQUEST, "해당 업무에 연결된 프로젝트가 없습니다."),

    // Kanban
    KANBAN_COLUMN_NOT_FOUND(HttpStatus.NOT_FOUND, "컬럼을 찾을 수 없습니다."),
    KANBAN_COLUMN_NOT_FOUND_ALT(HttpStatus.NOT_FOUND, "칼럼이 없습니다."),
    KANBAN_TARGET_COLUMN_NOT_FOUND(HttpStatus.NOT_FOUND, "목표 컬럼이 존재하지 않습니다."),
    KANBAN_TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 업무입니다."),
    KANBAN_TASK_NOT_FOUND_ALT(HttpStatus.NOT_FOUND, "업무를 찾을 수 없습니다."),

    // Budget
    BUDGET_EXCEEDED(HttpStatus.BAD_REQUEST, "예산이 초과되었습니다."),

    // Approval
    APPROVAL_NOT_FOUND(HttpStatus.NOT_FOUND, "결재 문서를 찾을 수 없습니다."),
    APPROVAL_NOT_FOUND_ALT(HttpStatus.NOT_FOUND, "존재하지 않는 결재 문서입니다."),
    APPROVAL_NO_PERMISSION(HttpStatus.FORBIDDEN, "결재 권한이 없습니다."),
    APPROVAL_VIEW_PERMISSION_DENIED(HttpStatus.FORBIDDEN, "해당 결재 문서를 조회할 권한이 없습니다."),
    APPROVAL_DRAFTER_ONLY(HttpStatus.FORBIDDEN, "기안자만 결재를 취소할 수 있습니다."),
    APPROVAL_ALREADY_PROCESSED(HttpStatus.CONFLICT, "이미 처리된 결재입니다."),
    APPROVAL_SEQUENCE_VIOLATION(HttpStatus.BAD_REQUEST, "이전 결재자가 승인하지 않았습니다."),
    APPROVAL_APPROVER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 결재자가 포함되어 있습니다."),

    // Auth
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 Refresh Token입니다."),
    NOT_REFRESH_TOKEN(HttpStatus.BAD_REQUEST, "Refresh Token이 아닙니다."),

    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
