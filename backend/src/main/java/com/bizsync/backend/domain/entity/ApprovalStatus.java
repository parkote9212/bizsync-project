package com.bizsync.backend.domain.entity;

public enum ApprovalStatus {
    TEMP,       // 임시저장
    PENDING,    // 결재 진행 중
    APPROVED,   // 최종 승인
    REJECTED    // 반려됨
}