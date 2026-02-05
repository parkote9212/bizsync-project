package com.bizsync.backend.domain.user.entity;

public enum Position {
    STAFF("사원"),
    SENIOR("대리"),
    ASSISTANT_MANAGER("과장"),
    DEPUTY_GENERAL_MANAGER("차장"),
    GENERAL_MANAGER("부장"),
    DIRECTOR("이사"),
    EXECUTIVE("임원");

    private final String korean;

    Position(String korean) {
        this.korean = korean;
    }

    public String getKorean() {
        return korean;
    }
}