package com.bizsync.backend.domain.entity;

public enum ColumnType {
    TODO("할 일"),
    IN_PROGRESS("진행 중"),
    DONE("완료");

    private final String korean;

    ColumnType(String korean) {
        this.korean = korean;
    }

    public String getKorean() {
        return korean;
    }
}
