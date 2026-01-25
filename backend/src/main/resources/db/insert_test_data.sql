-- BizSync 프로젝트 테스트 데이터 생성 스크립트
-- MariaDB/MySQL 호환

-- 기존 데이터 삭제 (외래키 제약조건으로 인해 역순으로 삭제)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE chat_message;
TRUNCATE TABLE approval_line;
TRUNCATE TABLE approval_document;
TRUNCATE TABLE task;
TRUNCATE TABLE kanban_column;
TRUNCATE TABLE project_member;
TRUNCATE TABLE project;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 사용자 데이터
-- 비밀번호: password123 (BCrypt 해시)
-- 주의: 기존 데이터가 있는 경우 user_id를 명시하지 않으면 외래키 참조가 깨질 수 있습니다
INSERT INTO users (email, password, name, emp_no, role, position, status, department, created_at, updated_at)
VALUES
    ('manager1@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '김부장', 'EMP002', 'MANAGER', 'GENERAL_MANAGER', 'ACTIVE', '개발팀', NOW(), NOW()),
    ('manager2@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '이과장', 'EMP003', 'MANAGER', 'ASSISTANT_MANAGER', 'ACTIVE', '기획팀', NOW(), NOW()),
    ('member1@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '박대리', 'EMP004', 'MEMBER', 'SENIOR', 'ACTIVE', '개발팀', NOW(), NOW()),
    ('member2@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '최사원', 'EMP005', 'MEMBER', 'STAFF', 'ACTIVE', '개발팀', NOW(), NOW()),
    ('member3@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '정대리', 'EMP006', 'MEMBER', 'SENIOR', 'ACTIVE', '기획팀', NOW(), NOW()),
    ('member4@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '강사원', 'EMP007', 'MEMBER', 'STAFF', 'ACTIVE', '디자인팀', NOW(), NOW()),
    ('member5@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '윤과장', 'EMP008', 'MEMBER', 'ASSISTANT_MANAGER', 'ACTIVE', '개발팀', NOW(), NOW()),
    ('pending@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '대기자', 'EMP009', 'MEMBER', 'STAFF', 'PENDING', '개발팀', NOW(), NOW()),
    ('suspended@bizsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '정지자', 'EMP010', 'MEMBER', 'STAFF', 'SUSPENDED', '개발팀', NOW(), NOW());

-- 사용자 ID를 변수에 저장 (다른 테이블에서 참조하기 위해)
SET @user_manager1 = (SELECT user_id FROM users WHERE email = 'manager1@bizsync.com');
SET @user_manager2 = (SELECT user_id FROM users WHERE email = 'manager2@bizsync.com');
SET @user_member1 = (SELECT user_id FROM users WHERE email = 'member1@bizsync.com');
SET @user_member2 = (SELECT user_id FROM users WHERE email = 'member2@bizsync.com');
SET @user_member3 = (SELECT user_id FROM users WHERE email = 'member3@bizsync.com');
SET @user_member4 = (SELECT user_id FROM users WHERE email = 'member4@bizsync.com');
SET @user_member5 = (SELECT user_id FROM users WHERE email = 'member5@bizsync.com');

-- 프로젝트 데이터
INSERT INTO project (name, description, start_date, end_date, total_budget, used_budget, status, created_at, updated_at, created_by, updated_by)
VALUES
    ('BizSync 웹 애플리케이션 개발', '프로젝트 관리 및 협업 플랫폼 개발', '2025-01-01', '2025-06-30', 50000000.00, 15000000.00, 'IN_PROGRESS', NOW(), NOW(), @user_manager1, @user_manager1),
    ('모바일 앱 개발 프로젝트', 'iOS/Android 모바일 애플리케이션 개발', '2025-02-01', '2025-08-31', 30000000.00, 5000000.00, 'PLANNING', NOW(), NOW(), @user_manager1, @user_manager1),
    ('시스템 리팩토링', '레거시 시스템 개선 및 리팩토링', '2025-01-15', '2025-05-31', 20000000.00, 8000000.00, 'IN_PROGRESS', NOW(), NOW(), @user_manager2, @user_manager2),
    ('완료된 프로젝트 예시', '이미 완료된 프로젝트 샘플', '2024-06-01', '2024-12-31', 40000000.00, 40000000.00, 'COMPLETED', NOW(), NOW(), @user_manager1, @user_manager1);

-- 프로젝트 ID를 변수에 저장
SET @project1 = (SELECT project_id FROM project WHERE name = 'BizSync 웹 애플리케이션 개발');
SET @project2 = (SELECT project_id FROM project WHERE name = '모바일 앱 개발 프로젝트');
SET @project3 = (SELECT project_id FROM project WHERE name = '시스템 리팩토링');
SET @project4 = (SELECT project_id FROM project WHERE name = '완료된 프로젝트 예시');

-- 프로젝트 멤버 데이터
INSERT INTO project_member (project_id, user_id, role, created_at, updated_at)
VALUES
    -- 프로젝트 1 멤버
    (@project1, @user_manager1, 'MANAGER', NOW(), NOW()),
    (@project1, @user_member1, 'MEMBER', NOW(), NOW()),
    (@project1, @user_member2, 'MEMBER', NOW(), NOW()),
    (@project1, @user_member5, 'MEMBER', NOW(), NOW()),
    -- 프로젝트 2 멤버
    (@project2, @user_manager1, 'MANAGER', NOW(), NOW()),
    (@project2, @user_manager2, 'MANAGER', NOW(), NOW()),
    (@project2, @user_member3, 'MEMBER', NOW(), NOW()),
    (@project2, @user_member4, 'MEMBER', NOW(), NOW()),
    -- 프로젝트 3 멤버
    (@project3, @user_manager2, 'MANAGER', NOW(), NOW()),
    (@project3, @user_member1, 'MEMBER', NOW(), NOW()),
    (@project3, @user_member2, 'MEMBER', NOW(), NOW()),
    -- 프로젝트 4 멤버
    (@project4, @user_manager1, 'MANAGER', NOW(), NOW());

-- 칸반 컬럼 데이터
INSERT INTO kanban_column (project_id, name, description, sequence, column_type, created_at, updated_at, created_by, updated_by)
VALUES
    -- 프로젝트 1 컬럼
    (@project1, '할 일', '시작 전 작업', 0, 'TODO', NOW(), NOW(), @user_manager1, @user_manager1),
    (@project1, '진행 중', '현재 작업 중인 항목', 1, 'IN_PROGRESS', NOW(), NOW(), @user_manager1, @user_manager1),
    (@project1, '완료', '완료된 작업', 2, 'DONE', NOW(), NOW(), @user_manager1, @user_manager1),
    -- 프로젝트 2 컬럼
    (@project2, '할 일', '시작 전 작업', 0, 'TODO', NOW(), NOW(), @user_manager1, @user_manager1),
    (@project2, '진행 중', '현재 작업 중인 항목', 1, 'IN_PROGRESS', NOW(), NOW(), @user_manager1, @user_manager1),
    (@project2, '완료', '완료된 작업', 2, 'DONE', NOW(), NOW(), @user_manager1, @user_manager1),
    -- 프로젝트 3 컬럼
    (@project3, '할 일', '시작 전 작업', 0, 'TODO', NOW(), NOW(), @user_manager2, @user_manager2),
    (@project3, '진행 중', '현재 작업 중인 항목', 1, 'IN_PROGRESS', NOW(), NOW(), @user_manager2, @user_manager2),
    (@project3, '완료', '완료된 작업', 2, 'DONE', NOW(), NOW(), @user_manager2, @user_manager2);

-- 칸반 컬럼 ID를 변수에 저장
SET @column1_todo = (SELECT column_id FROM kanban_column WHERE project_id = @project1 AND sequence = 0);
SET @column1_progress = (SELECT column_id FROM kanban_column WHERE project_id = @project1 AND sequence = 1);
SET @column1_done = (SELECT column_id FROM kanban_column WHERE project_id = @project1 AND sequence = 2);
SET @column2_todo = (SELECT column_id FROM kanban_column WHERE project_id = @project2 AND sequence = 0);
SET @column2_progress = (SELECT column_id FROM kanban_column WHERE project_id = @project2 AND sequence = 1);
SET @column3_todo = (SELECT column_id FROM kanban_column WHERE project_id = @project3 AND sequence = 0);
SET @column3_progress = (SELECT column_id FROM kanban_column WHERE project_id = @project3 AND sequence = 1);

-- 업무(Task) 데이터
INSERT INTO task (column_id, worker_id, title, content, deadline, sequence, created_at, updated_at, created_by, updated_by)
VALUES
    -- 프로젝트 1 업무
    (@column1_todo, @user_member1, '로그인 기능 구현', '사용자 인증 및 JWT 토큰 발급 기능 개발', '2025-02-15', 0, NOW(), NOW(), @user_manager1, @user_manager1),
    (@column1_progress, @user_member2, '프로젝트 생성 API', '프로젝트 CRUD API 개발', '2025-02-20', 0, NOW(), NOW(), @user_manager1, @user_manager1),
    (@column1_progress, @user_member5, '칸반 보드 UI', '드래그 앤 드롭 기능 포함 칸반 보드 구현', '2025-02-25', 1, NOW(), NOW(), @user_manager1, @user_manager1),
    (@column1_done, @user_member1, '데이터베이스 설계', 'ERD 작성 및 테이블 생성', '2025-01-31', 0, NOW(), NOW(), @user_manager1, @user_manager1),
    -- 프로젝트 2 업무
    (@column2_todo, @user_member3, '앱 와이어프레임 작성', '모바일 앱 UI/UX 와이어프레임 설계', '2025-03-01', 0, NOW(), NOW(), @user_manager1, @user_manager1),
    (@column2_progress, @user_member4, '디자인 시스템 구축', '컬러 팔레트 및 컴포넌트 라이브러리', '2025-03-10', 0, NOW(), NOW(), @user_manager2, @user_manager2),
    -- 프로젝트 3 업무
    (@column3_todo, @user_member1, '레거시 코드 분석', '기존 시스템 구조 분석 및 문서화', '2025-02-28', 0, NOW(), NOW(), @user_manager2, @user_manager2),
    (@column3_progress, @user_member2, 'API 리팩토링', 'RESTful API 표준 준수 및 개선', '2025-03-15', 0, NOW(), NOW(), @user_manager2, @user_manager2);

-- 결재 문서 데이터
INSERT INTO approval_document (drafter_id, project_id, title, content, type, status, amount, completed_at, created_at, updated_at, created_by, updated_by)
VALUES
    (@user_member1, @project1, '개발 서버 구축 비용 결재', 'AWS EC2 인스턴스 및 RDS 구축 비용', 'EXPENSE', 'PENDING', 5000000.00, NULL, NOW(), NOW(), @user_member1, @user_member1),
    (@user_member2, @project1, '연차 휴가 신청', '2025년 2월 20일 ~ 2월 22일 (3일간)', 'LEAVE', 'APPROVED', NULL, NOW(), NOW(), NOW(), @user_member2, @user_member2),
    (@user_member3, @project2, '디자인 툴 라이선스 구매', 'Figma Pro 라이선스 구매', 'EXPENSE', 'PENDING', 1200000.00, NULL, NOW(), NOW(), @user_member3, @user_member3),
    (@user_member1, @project1, '외부 컨설팅 업무 결재', '시스템 아키텍처 컨설팅', 'WORK', 'REJECTED', 10000000.00, NOW(), NOW(), NOW(), @user_member1, @user_member1),
    (@user_member5, @project1, '교육비 지원 신청', 'Spring Boot 고급 과정 교육비', 'EXPENSE', 'PENDING', 800000.00, NULL, NOW(), NOW(), @user_member5, @user_member5);

-- 결재 문서 ID를 변수에 저장
SET @doc1 = (SELECT document_id FROM approval_document WHERE title = '개발 서버 구축 비용 결재');
SET @doc2 = (SELECT document_id FROM approval_document WHERE title = '연차 휴가 신청');
SET @doc3 = (SELECT document_id FROM approval_document WHERE title = '디자인 툴 라이선스 구매');
SET @doc4 = (SELECT document_id FROM approval_document WHERE title = '외부 컨설팅 업무 결재');
SET @doc5 = (SELECT document_id FROM approval_document WHERE title = '교육비 지원 신청');

-- 결재 라인 데이터
INSERT INTO approval_line (document_id, approver_id, sequence, status, approved_at, comment, created_at, updated_at)
VALUES
    -- 문서 1: 대기 중 (2단계 결재)
    (@doc1, @user_member5, 1, 'PENDING', NULL, NULL, NOW(), NOW()),
    (@doc1, @user_manager1, 2, 'PENDING', NULL, NULL, NOW(), NOW()),
    -- 문서 2: 승인 완료 (1단계 결재)
    (@doc2, @user_member5, 1, 'APPROVED', NOW(), '승인합니다', NOW(), NOW()),
    -- 문서 3: 대기 중 (1단계 결재)
    (@doc3, @user_manager2, 1, 'PENDING', NULL, NULL, NOW(), NOW()),
    -- 문서 4: 반려됨 (2단계 결재, 1단계만 완료)
    (@doc4, @user_member5, 1, 'APPROVED', NOW(), '1차 승인', NOW(), NOW()),
    (@doc4, @user_manager1, 2, 'REJECTED', NOW(), '예산 초과로 반려', NOW(), NOW()),
    -- 문서 5: 대기 중 (2단계 결재)
    (@doc5, @user_member5, 1, 'PENDING', NULL, NULL, NOW(), NOW()),
    (@doc5, @user_manager1, 2, 'PENDING', NULL, NULL, NOW(), NOW());

-- 채팅 메시지 데이터
INSERT INTO chat_message (room_id, sender_id, content, message_type, sent_at)
VALUES
    -- 프로젝트 1 채팅
    (@project1, @user_manager1, '프로젝트 시작합니다! 모두 화이팅!', 'TEXT', DATE_SUB(NOW(), INTERVAL 7 DAY)),
    (@project1, @user_member1, '네, 열심히 하겠습니다!', 'TEXT', DATE_SUB(NOW(), INTERVAL 7 DAY)),
    (@project1, @user_member1, '로그인 기능 구현 중입니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 5 DAY)),
    (@project1, @user_member2, '프로젝트 API 작업 시작했습니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 4 DAY)),
    (@project1, @user_member5, '칸반 보드 UI 거의 완성되었습니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 2 DAY)),
    (@project1, @user_manager1, '좋습니다! 코드 리뷰 부탁드립니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 1 DAY)),
    -- 프로젝트 2 채팅
    (@project2, @user_manager1, '모바일 앱 프로젝트 킥오프 미팅 일정 공유합니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 3 DAY)),
    (@project2, @user_manager2, '와이어프레임 작업 시작하겠습니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 2 DAY)),
    (@project2, @user_member4, '디자인 시스템 구축 중입니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 1 DAY)),
    -- 프로젝트 3 채팅
    (@project3, @user_manager2, '리팩토링 작업 계획 공유합니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 5 DAY)),
    (@project3, @user_member1, '레거시 코드 분석 완료했습니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 3 DAY)),
    (@project3, @user_member2, 'API 리팩토링 진행 중입니다', 'TEXT', DATE_SUB(NOW(), INTERVAL 1 DAY));
