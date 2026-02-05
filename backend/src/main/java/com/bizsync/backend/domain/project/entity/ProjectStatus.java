package com.bizsync.backend.domain.project.entity;

public enum ProjectStatus {
    PLANNING("기획중"),
    IN_PROGRESS("진행중"),
    COMPLETED("완료"),
    ON_HOLD("보류"),
    CANCELLED("취소"),
    ARCHIVED("아카이빙");

    private final String korean;

    ProjectStatus(String korean) {
        this.korean = korean;
    }

    public String getKorean() {
        return korean;
    }
}
