package com.bizsync.backend.domain.entity;

public enum ApprovalType {
    LEAVE("휴가"),
    EXPENSE("비용"),
    WORK("업무");

    private final String description;

    ApprovalType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}