-- BizSync 데이터베이스 스키마 생성 스크립트
-- MariaDB/MySQL용

-- 데이터베이스 생성 (이미 존재하는 경우 무시)
CREATE DATABASE IF NOT EXISTS bizsync_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bizsync_db;

-- 1. 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(20) NOT NULL,
    emp_no VARCHAR(20) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    position VARCHAR(30),
    department VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 프로젝트 테이블
CREATE TABLE IF NOT EXISTS project (
    project_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    total_budget DECIMAL(19, 2),
    used_budget DECIMAL(19, 2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 프로젝트 멤버 테이블
CREATE TABLE IF NOT EXISTS project_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_user (project_id, user_id),
    INDEX idx_project_member_user (user_id),
    INDEX idx_project_member_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 칸반 컬럼 테이블
CREATE TABLE IF NOT EXISTS kanban_column (
    column_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    sequence INT NOT NULL,
    column_type VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 업무 테이블
CREATE TABLE IF NOT EXISTS task (
    task_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    column_id BIGINT NOT NULL,
    worker_id BIGINT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    deadline DATE,
    sequence INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (column_id) REFERENCES kanban_column(column_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_task_worker (worker_id),
    INDEX idx_task_column (column_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 결재 문서 테이블
CREATE TABLE IF NOT EXISTS approval_document (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    drafter_id BIGINT NOT NULL,
    project_id BIGINT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(19, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (drafter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 결재 라인 테이블
CREATE TABLE IF NOT EXISTS approval_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    sequence INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at DATETIME,
    comment TEXT,
    FOREIGN KEY (document_id) REFERENCES approval_document(document_id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_approval_line_approver (approver_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    sender VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_room (room_id),
    INDEX idx_chat_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 초기 데이터 (선택사항)
-- 관리자 계정 생성 예시 (비밀번호는 BCrypt로 해시화된 값으로 변경 필요)
-- INSERT INTO users (email, password, name, department, role, position, created_at)
-- VALUES ('admin@bizsync.com', '$2a$10$...', '시스템 관리자', 'IT', 'ADMIN', 'MANAGER', NOW())
-- ON DUPLICATE KEY UPDATE email=email;
