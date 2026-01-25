-- ============================================
-- 가데이터 삽입 SQL
-- 집계 기능 테스트용 샘플 데이터
-- ============================================

-- 1. 사용자 데이터 삽입 (FK 없음, 가장 먼저)
-- 비밀번호는 모두 "password123" (BCrypt 해시값)
INSERT INTO users (email, password, name, emp_no, role, position, status, department, created_at, updated_at)
VALUES
    -- 관리자
    ('admin@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자', 'EMP001', 'ADMIN',
     'DIRECTOR', 'ACTIVE', '경영지원팀', NOW(), NOW()),
    -- 매니저
    ('manager1@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '김매니저', 'EMP002', 'MANAGER',
     'GENERAL_MANAGER', 'ACTIVE', '개발팀', NOW(), NOW()),
    ('manager2@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '이매니저', 'EMP003', 'MANAGER',
     'DEPUTY_GENERAL_MANAGER', 'ACTIVE', '기획팀', NOW(), NOW()),
    -- 일반 멤버
    ('user1@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '홍길동', 'EMP004', 'MEMBER',
     'SENIOR', 'ACTIVE', '개발팀', NOW(), NOW()),
    ('user2@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '김철수', 'EMP005', 'MEMBER',
     'STAFF', 'ACTIVE', '개발팀', NOW(), NOW()),
    ('user3@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '이영희', 'EMP006', 'MEMBER',
     'ASSISTANT_MANAGER', 'ACTIVE', '기획팀', NOW(), NOW()),
    ('user4@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '박민수', 'EMP007', 'MEMBER',
     'SENIOR', 'PENDING', '기획팀', NOW(), NOW()),
    ('user5@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '최지영', 'EMP008', 'MEMBER',
     'STAFF', 'SUSPENDED', '디자인팀', NOW(), NOW()),
    ('user6@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '정수진', 'EMP009', 'MEMBER',
     'EXECUTIVE', 'ACTIVE', '경영지원팀', NOW(), NOW()),
    ('user7@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '강동원', 'EMP010', 'MEMBER',
     'DIRECTOR', 'DELETED', '개발팀', NOW(), NOW());

-- 2. 프로젝트 데이터 삽입 (FK 없음)
-- 프로젝트 ID는 AUTO_INCREMENT이므로 명시하지 않음
INSERT INTO project (name, description, start_date, end_date, total_budget, used_budget, status, created_at, updated_at,
                     created_by, updated_by)
VALUES ('테스트 프로젝트 1', '기획중인 프로젝트', '2026-02-01', '2026-03-31', 10000000.00, 0.00, 'PLANNING', NOW(), NOW(), 1, 1),
       ('테스트 프로젝트 2', '진행중인 프로젝트', '2026-01-15', '2026-04-30', 50000000.00, 15000000.00, 'IN_PROGRESS', NOW(), NOW(), 2,
        2),
       ('테스트 프로젝트 3', '완료된 프로젝트', '2025-10-01', '2025-12-31', 30000000.00, 30000000.00, 'COMPLETED', NOW(), NOW(), 2,
        2),
       ('테스트 프로젝트 4', '보류된 프로젝트', '2026-03-01', '2026-06-30', 20000000.00, 5000000.00, 'ON_HOLD', NOW(), NOW(), 3, 3),
       ('테스트 프로젝트 5', '취소된 프로젝트', '2026-01-01', '2026-02-28', 15000000.00, 0.00, 'CANCELLED', NOW(), NOW(), 1, 1);

-- 3. 프로젝트 멤버 데이터 삽입 (project_id, user_id FK)
-- 프로젝트 ID는 LAST_INSERT_ID()를 사용하거나 직접 지정
-- 주의: 프로젝트가 순차적으로 삽입되므로 첫 번째 프로젝트는 마지막 삽입된 ID - 4
INSERT INTO project_member (project_id, user_id, role, created_at, updated_at)
SELECT p.project_id, u.user_id, 'PL', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 1'
  AND u.email = 'admin@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'MEMBER', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 1'
  AND u.email = 'user1@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'MEMBER', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 1'
  AND u.email = 'user2@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'PL', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 2'
  AND u.email = 'manager1@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'MEMBER', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 2'
  AND u.email = 'user1@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'MEMBER', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 2'
  AND u.email = 'user2@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'MEMBER', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 2'
  AND u.email = 'user3@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'PL', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 3'
  AND u.email = 'manager1@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'MEMBER', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 3'
  AND u.email = 'user1@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'PL', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 4'
  AND u.email = 'manager2@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'MEMBER', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 4'
  AND u.email = 'user3@test.com'
UNION ALL
SELECT p.project_id, u.user_id, 'PL', NOW(), NOW()
FROM project p,
     users u
WHERE p.name = '테스트 프로젝트 5'
  AND u.email = 'admin@test.com';

-- 4. 칸반 컬럼 데이터 삽입 (project_id FK)
INSERT INTO kanban_column (project_id, name, description, sequence, column_type, created_at, updated_at, created_by,
                           updated_by)
SELECT p.project_id,
       'To Do',
       '할 일',
       1,
       'TODO',
       NOW(),
       NOW(),
       2,
       2
FROM project p
WHERE p.name = '테스트 프로젝트 2'
UNION ALL
SELECT p.project_id,
       'In Progress',
       '진행 중',
       2,
       'IN_PROGRESS',
       NOW(),
       NOW(),
       2,
       2
FROM project p
WHERE p.name = '테스트 프로젝트 2'
UNION ALL
SELECT p.project_id,
       'Done',
       '완료',
       3,
       'DONE',
       NOW(),
       NOW(),
       2,
       2
FROM project p
WHERE p.name = '테스트 프로젝트 2'
UNION ALL
SELECT p.project_id,
       'To Do',
       '할 일',
       1,
       'TODO',
       NOW(),
       NOW(),
       2,
       2
FROM project p
WHERE p.name = '테스트 프로젝트 3'
UNION ALL
SELECT p.project_id,
       'Done',
       '완료',
       2,
       'DONE',
       NOW(),
       NOW(),
       2,
       2
FROM project p
WHERE p.name = '테스트 프로젝트 3';

-- 5. 업무 데이터 삽입 (column_id, worker_id FK)
-- 컬럼 ID를 조회하여 삽입
INSERT INTO task (column_id, worker_id, title, content, deadline, sequence, created_at, updated_at, created_by,
                  updated_by)
SELECT kc.column_id,
       u.user_id,
       '업무 1',
       '테스트 업무 1',
       '2026-02-15',
       1,
       NOW(),
       NOW(),
       2,
       2
FROM kanban_column kc,
     project p,
     users u
WHERE kc.project_id = p.project_id
  AND p.name = '테스트 프로젝트 2'
  AND kc.name = 'To Do'
  AND kc.sequence = 1
  AND u.email = 'user1@test.com'
UNION ALL
SELECT kc.column_id,
       u.user_id,
       '업무 2',
       '테스트 업무 2',
       '2026-02-20',
       2,
       NOW(),
       NOW(),
       2,
       2
FROM kanban_column kc,
     project p,
     users u
WHERE kc.project_id = p.project_id
  AND p.name = '테스트 프로젝트 2'
  AND kc.name = 'To Do'
  AND kc.sequence = 1
  AND u.email = 'user2@test.com'
UNION ALL
SELECT kc.column_id,
       u.user_id,
       '업무 3',
       '진행중인 업무',
       '2026-02-25',
       1,
       NOW(),
       NOW(),
       2,
       2
FROM kanban_column kc,
     project p,
     users u
WHERE kc.project_id = p.project_id
  AND p.name = '테스트 프로젝트 2'
  AND kc.name = 'In Progress'
  AND kc.sequence = 2
  AND u.email = 'user1@test.com'
UNION ALL
SELECT kc.column_id,
       u.user_id,
       '업무 4',
       '완료된 업무',
       '2026-02-10',
       1,
       NOW(),
       NOW(),
       2,
       2
FROM kanban_column kc,
     project p,
     users u
WHERE kc.project_id = p.project_id
  AND p.name = '테스트 프로젝트 2'
  AND kc.name = 'Done'
  AND kc.sequence = 3
  AND u.email = 'user2@test.com'
UNION ALL
SELECT kc.column_id,
       u.user_id,
       '완료된 업무 1',
       '완료된 프로젝트의 업무',
       '2025-11-15',
       1,
       NOW(),
       NOW(),
       2,
       2
FROM kanban_column kc,
     project p,
     users u
WHERE kc.project_id = p.project_id
  AND p.name = '테스트 프로젝트 3'
  AND kc.name = 'To Do'
  AND kc.sequence = 1
  AND u.email = 'user1@test.com'
UNION ALL
SELECT kc.column_id,
       u.user_id,
       '완료된 업무 2',
       '완료된 프로젝트의 업무',
       '2025-12-01',
       1,
       NOW(),
       NOW(),
       2,
       2
FROM kanban_column kc,
     project p,
     users u
WHERE kc.project_id = p.project_id
  AND p.name = '테스트 프로젝트 3'
  AND kc.name = 'Done'
  AND kc.sequence = 2
  AND u.email = 'user1@test.com';

-- 6. 결재 문서 데이터 삽입 (drafter_id, project_id FK)
INSERT INTO approval_document (drafter_id, project_id, title, content, type, status, amount, created_at, updated_at,
                               created_by, updated_by)
SELECT u1.user_id,
       p.project_id,
       '프로젝트 비용 결재',
       '프로젝트 진행을 위한 비용 결재',
       'EXPENSE',
       'APPROVED',
       5000000.00,
       NOW(),
       NOW(),
       u1.user_id,
       u1.user_id
FROM users u1,
     project p
WHERE u1.email = 'user1@test.com'
  AND p.name = '테스트 프로젝트 2'
UNION ALL
SELECT u2.user_id,
       p.project_id,
       '추가 비용 결재',
       '추가 비용 결재 요청',
       'EXPENSE',
       'PENDING',
       3000000.00,
       NOW(),
       NOW(),
       u2.user_id,
       u2.user_id
FROM users u2,
     project p
WHERE u2.email = 'user2@test.com'
  AND p.name = '테스트 프로젝트 2'
UNION ALL
SELECT u1.user_id,
       NULL,
       '연차 사용 신청',
       '2026년 연차 사용',
       'LEAVE',
       'APPROVED',
       NULL,
       NOW(),
       NOW(),
       u1.user_id,
       u1.user_id
FROM users u1
WHERE u1.email = 'user1@test.com'
UNION ALL
SELECT u2.user_id,
       NULL,
       '병가 신청',
       '병가 신청서',
       'LEAVE',
       'REJECTED',
       NULL,
       NOW(),
       NOW(),
       u2.user_id,
       u2.user_id
FROM users u2
WHERE u2.email = 'user2@test.com'
UNION ALL
SELECT u3.user_id,
       NULL,
       '업무 승인 요청',
       '새로운 업무 승인 요청',
       'WORK',
       'PENDING',
       NULL,
       NOW(),
       NOW(),
       u3.user_id,
       u3.user_id
FROM users u3
WHERE u3.email = 'user3@test.com';

-- 7. 결재선 데이터 삽입 (document_id, approver_id FK)
INSERT INTO approval_line (document_id, approver_id, sequence, status, comment, approved_at, created_at, updated_at)
SELECT ad.document_id,
       u.user_id,
       1,
       'APPROVED',
       '승인합니다',
       NOW(),
       NOW(),
       NOW()
FROM approval_document ad,
     users u
WHERE ad.title = '프로젝트 비용 결재'
  AND u.email = 'manager1@test.com'
UNION ALL
SELECT ad.document_id,
       u.user_id,
       1,
       'PENDING',
       NULL,
       NULL,
       NOW(),
       NOW()
FROM approval_document ad,
     users u
WHERE ad.title = '추가 비용 결재'
  AND u.email = 'manager1@test.com'
UNION ALL
SELECT ad.document_id,
       u.user_id,
       1,
       'APPROVED',
       '승인',
       NOW(),
       NOW(),
       NOW()
FROM approval_document ad,
     users u
WHERE ad.title = '연차 사용 신청'
  AND u.email = 'manager1@test.com'
UNION ALL
SELECT ad.document_id,
       u.user_id,
       1,
       'REJECTED',
       '반려 사유: 일정 조정 필요',
       NOW(),
       NOW(),
       NOW()
FROM approval_document ad,
     users u
WHERE ad.title = '병가 신청'
  AND u.email = 'manager1@test.com'
UNION ALL
SELECT ad.document_id,
       u.user_id,
       1,
       'PENDING',
       NULL,
       NULL,
       NOW(),
       NOW()
FROM approval_document ad,
     users u
WHERE ad.title = '업무 승인 요청'
  AND u.email = 'manager1@test.com';
