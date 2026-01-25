-- BizSync 프로젝트 데이터베이스 스키마 생성 스크립트
-- MariaDB/MySQL 호환

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users
(
    user_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    name       VARCHAR(20)  NOT NULL,
    emp_no     VARCHAR(20) UNIQUE,
    role       VARCHAR(20)  NOT NULL,
    position   VARCHAR(30),
    status     VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    department VARCHAR(50),
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_emp_no (emp_no)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS project
(
    project_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    start_date   DATE,
    end_date     DATE,
    total_budget DECIMAL(19, 2),
    used_budget  DECIMAL(19, 2)        DEFAULT 0.00,
    status       VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by   BIGINT,
    updated_by   BIGINT,
    INDEX idx_status (status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 프로젝트 멤버 테이블
CREATE TABLE IF NOT EXISTS project_member
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    role       VARCHAR(20) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_project_user (project_id, user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 칸반 컬럼 테이블
CREATE TABLE IF NOT EXISTS kanban_column
(
    column_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id  BIGINT      NOT NULL,
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    sequence    INT         NOT NULL,
    column_type VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  BIGINT,
    updated_by  BIGINT,
    FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    INDEX idx_sequence (project_id, sequence)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 업무(Task) 테이블
CREATE TABLE IF NOT EXISTS task
(
    task_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    column_id  BIGINT       NOT NULL,
    worker_id  BIGINT,
    title      VARCHAR(255) NOT NULL,
    content    TEXT,
    deadline   DATE,
    sequence   INT          NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (column_id) REFERENCES kanban_column (column_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users (user_id) ON DELETE SET NULL,
    INDEX idx_column_id (column_id),
    INDEX idx_worker_id (worker_id),
    INDEX idx_sequence (column_id, sequence)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 결재 문서 테이블
CREATE TABLE IF NOT EXISTS approval_document
(
    document_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    drafter_id   BIGINT       NOT NULL,
    project_id   BIGINT,
    title        VARCHAR(255) NOT NULL,
    content      TEXT,
    type         VARCHAR(20)  NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    amount       DECIMAL(19, 2),
    completed_at DATETIME,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by   BIGINT,
    updated_by   BIGINT,
    FOREIGN KEY (drafter_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE SET NULL,
    INDEX idx_drafter_id (drafter_id),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 결재 라인 테이블
CREATE TABLE IF NOT EXISTS approval_line
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT      NOT NULL,
    approver_id BIGINT      NOT NULL,
    sequence    INT         NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at DATETIME,
    comment     TEXT,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES approval_document (document_id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users (user_id) ON DELETE CASCADE,
    INDEX idx_document_id (document_id),
    INDEX idx_approver_id (approver_id),
    INDEX idx_sequence (document_id, sequence)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_message
(
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT       NOT NULL,
    sender  VARCHAR(255) NOT NULL,
    content TEXT         NOT NULL,
    sent_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_id (room_id),
    INDEX idx_sent_at (sent_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
