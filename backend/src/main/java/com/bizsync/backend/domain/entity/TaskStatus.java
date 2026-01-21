package com.bizsync.backend.domain.entity;

public enum TaskStatus {
  TODO("할일"),
  IN_PROGRESS("진행중"),
  COMPLETED("완료");

  private final String korean;

  TaskStatus(String korean) {
    this.korean = korean;
  }

  public String getKorean() {
    return korean;
  }
}
