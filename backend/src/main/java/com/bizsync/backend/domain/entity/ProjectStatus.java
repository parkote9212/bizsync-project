package com.bizsync.backend.domain.entity;

public enum ProjectStatus {
  PLANNING("기획중"),
  IN_PROGRESS("진행중"),
  COMPLETED("완료"),
  ON_HOLD("보류"),
  CANCELLED("취소");

  private final String korean;

  ProjectStatus(String korean) {
    this.korean = korean;
  }

  public String getKorean() {
    return korean;
  }
}
