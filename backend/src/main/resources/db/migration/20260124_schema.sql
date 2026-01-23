-- =====================================================
-- 스키마 마이그레이션: BaseTimeEntity 및 BaseEntity 적용
-- 날짜: 2026-01-24
-- 설명: 
--   1. users 테이블에 status, created_at, updated_at 컬럼 추가
--   2. BaseTimeEntity 상속 엔티티에 created_at, updated_at 추가
--   3. BaseEntity 상속 엔티티에 created_at, updated_at, created_by, updated_by 추가
-- =====================================================

-- =====================================================
-- 1. users 테이블 수정
-- =====================================================

-- status 컬럼 추가 (기존 컬럼이 없을 경우에만)
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'status';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' VARCHAR(20) NOT NULL DEFAULT ''ACTIVE''')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 기존 사용자들의 status를 ACTIVE로 설정 (NULL인 경우)
UPDATE users
SET status = 'ACTIVE'
WHERE status IS NULL;

-- created_at 컬럼 추가
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- updated_at 컬럼 추가
SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 기존 데이터에 현재 시간 설정 (NULL인 경우)
UPDATE users
SET created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL
   OR updated_at IS NULL;

-- =====================================================
-- 2. BaseTimeEntity 상속 엔티티 수정
-- (ProjectMember, ApprovalLine)
-- =====================================================

-- project_member 테이블
SET @tablename = 'project_member';
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

UPDATE project_member
SET created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL
   OR updated_at IS NULL;

-- approval_line 테이블
SET @tablename = 'approval_line';
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

UPDATE approval_line
SET created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL
   OR updated_at IS NULL;

-- =====================================================
-- 3. BaseEntity 상속 엔티티 수정
-- (Project, Task, KanbanColumn, ApprovalDocument)
-- =====================================================

-- project 테이블
SET @tablename = 'project';
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'created_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

UPDATE project
SET created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL
   OR updated_at IS NULL;

-- task 테이블
SET @tablename = 'task';
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'created_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

UPDATE task
SET created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL
   OR updated_at IS NULL;

-- kanban_column 테이블
SET @tablename = 'kanban_column';
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'created_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

UPDATE kanban_column
SET created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL
   OR updated_at IS NULL;

-- approval_document 테이블
SET @tablename = 'approval_document';
SET @columnname = 'created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname,
                                                ' TIMESTAMP NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'created_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.COLUMNS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = @tablename
                                            AND COLUMN_NAME = @columnname) > 0,
                                         'SELECT 1',
                                         CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL')
                                 ));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

UPDATE approval_document
SET created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL
   OR updated_at IS NULL;

-- =====================================================
-- 4. 인덱스 추가 (성능 최적화)
-- =====================================================

-- users 테이블 인덱스
SET @indexname = 'idx_users_status';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.STATISTICS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = 'users'
                                            AND INDEX_NAME = @indexname) > 0,
                                         'SELECT 1',
                                         CONCAT('CREATE INDEX ', @indexname, ' ON users(status)')
                                 ));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @indexname = 'idx_users_created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.STATISTICS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = 'users'
                                            AND INDEX_NAME = @indexname) > 0,
                                         'SELECT 1',
                                         CONCAT('CREATE INDEX ', @indexname, ' ON users(created_at)')
                                 ));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- project 테이블 인덱스
SET @indexname = 'idx_project_created_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.STATISTICS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = 'project'
                                            AND INDEX_NAME = @indexname) > 0,
                                         'SELECT 1',
                                         CONCAT('CREATE INDEX ', @indexname, ' ON project(created_by)')
                                 ));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @indexname = 'idx_project_created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.STATISTICS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = 'project'
                                            AND INDEX_NAME = @indexname) > 0,
                                         'SELECT 1',
                                         CONCAT('CREATE INDEX ', @indexname, ' ON project(created_at)')
                                 ));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- task 테이블 인덱스
SET @indexname = 'idx_task_created_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.STATISTICS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = 'task'
                                            AND INDEX_NAME = @indexname) > 0,
                                         'SELECT 1',
                                         CONCAT('CREATE INDEX ', @indexname, ' ON task(created_by)')
                                 ));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @indexname = 'idx_task_created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.STATISTICS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = 'task'
                                            AND INDEX_NAME = @indexname) > 0,
                                         'SELECT 1',
                                         CONCAT('CREATE INDEX ', @indexname, ' ON task(created_at)')
                                 ));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- approval_document 테이블 인덱스
SET @indexname = 'idx_approval_document_created_by';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.STATISTICS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = 'approval_document'
                                            AND INDEX_NAME = @indexname) > 0,
                                         'SELECT 1',
                                         CONCAT('CREATE INDEX ', @indexname, ' ON approval_document(created_by)')
                                 ));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @indexname = 'idx_approval_document_created_at';
SET @preparedStatement = (SELECT IF(
                                         (SELECT COUNT(*)
                                          FROM INFORMATION_SCHEMA.STATISTICS
                                          WHERE TABLE_SCHEMA = @dbname
                                            AND TABLE_NAME = 'approval_document'
                                            AND INDEX_NAME = @indexname) > 0,
                                         'SELECT 1',
                                         CONCAT('CREATE INDEX ', @indexname, ' ON approval_document(created_at)')
                                 ));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- =====================================================
-- 5. 외래키 제약조건 추가 (선택사항)
-- =====================================================

-- project.created_by -> users.user_id
-- ALTER TABLE project 
--     ADD CONSTRAINT fk_project_created_by 
--     FOREIGN KEY (created_by) REFERENCES users(user_id) 
--     ON DELETE SET NULL;

-- project.updated_by -> users.user_id
-- ALTER TABLE project 
--     ADD CONSTRAINT fk_project_updated_by 
--     FOREIGN KEY (updated_by) REFERENCES users(user_id) 
--     ON DELETE SET NULL;

-- task.created_by -> users.user_id
-- ALTER TABLE task 
--     ADD CONSTRAINT fk_task_created_by 
--     FOREIGN KEY (created_by) REFERENCES users(user_id) 
--     ON DELETE SET NULL;

-- task.updated_by -> users.user_id
-- ALTER TABLE task 
--     ADD CONSTRAINT fk_task_updated_by 
--     FOREIGN KEY (updated_by) REFERENCES users(user_id) 
--     ON DELETE SET NULL;

-- kanban_column.created_by -> users.user_id
-- ALTER TABLE kanban_column 
--     ADD CONSTRAINT fk_kanban_column_created_by 
--     FOREIGN KEY (created_by) REFERENCES users(user_id) 
--     ON DELETE SET NULL;

-- kanban_column.updated_by -> users.user_id
-- ALTER TABLE kanban_column 
--     ADD CONSTRAINT fk_kanban_column_updated_by 
--     FOREIGN KEY (updated_by) REFERENCES users(user_id) 
--     ON DELETE SET NULL;

-- approval_document.created_by -> users.user_id
-- ALTER TABLE approval_document 
--     ADD CONSTRAINT fk_approval_document_created_by 
--     FOREIGN KEY (created_by) REFERENCES users(user_id) 
--     ON DELETE SET NULL;

-- approval_document.updated_by -> users.user_id
-- ALTER TABLE approval_document 
--     ADD CONSTRAINT fk_approval_document_updated_by 
--     FOREIGN KEY (updated_by) REFERENCES users(user_id) 
--     ON DELETE SET NULL;

-- =====================================================
-- 마이그레이션 완료 확인 쿼리
-- =====================================================

-- SELECT 
--     'users' as table_name,
--     COUNT(*) as total_rows,
--     COUNT(created_at) as has_created_at,
--     COUNT(updated_at) as has_updated_at,
--     COUNT(status) as has_status
-- FROM users
-- UNION ALL
-- SELECT 
--     'project' as table_name,
--     COUNT(*) as total_rows,
--     COUNT(created_at) as has_created_at,
--     COUNT(updated_at) as has_updated_at,
--     COUNT(created_by) as has_created_by
-- FROM project
-- UNION ALL
-- SELECT 
--     'task' as table_name,
--     COUNT(*) as total_rows,
--     COUNT(created_at) as has_created_at,
--     COUNT(updated_at) as has_updated_at,
--     COUNT(created_by) as has_created_by
-- FROM task;
