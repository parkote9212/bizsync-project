-- ============================================
-- 가데이터 삭제 SQL
-- FK 관계를 고려하여 역순으로 삭제
-- ============================================

-- 7. 결재선 삭제 (가장 나중에 생성된 데이터)
-- 먼저 삭제할 document_id를 확인
DELETE al
FROM approval_line al
         INNER JOIN approval_document ad ON al.document_id = ad.document_id
WHERE ad.title IN (
                   '프로젝트 비용 결재', '추가 비용 결재', '연차 사용 신청',
                   '병가 신청', '업무 승인 요청'
    );

-- 6. 결재 문서 삭제
DELETE
FROM approval_document
WHERE title IN (
                '프로젝트 비용 결재', '추가 비용 결재', '연차 사용 신청',
                '병가 신청', '업무 승인 요청'
    );

-- 5. 업무 삭제
DELETE
FROM task
WHERE title IN (
                '업무 1', '업무 2', '업무 3', '업무 4',
                '완료된 업무 1', '완료된 업무 2'
    );

-- 4. 칸반 컬럼 삭제
DELETE kc
FROM kanban_column kc
         INNER JOIN project p ON kc.project_id = p.project_id
WHERE p.name LIKE '테스트 프로젝트%';

-- 3. 프로젝트 멤버 삭제
DELETE pm
FROM project_member pm
         INNER JOIN project p ON pm.project_id = p.project_id
WHERE p.name LIKE '테스트 프로젝트%';

-- 2. 프로젝트 삭제
DELETE
FROM project
WHERE name LIKE '테스트 프로젝트%';

-- 1. 사용자 삭제 (가장 먼저 생성된 데이터)
DELETE
FROM users
WHERE email IN (
                'admin@test.com', 'manager1@test.com', 'manager2@test.com',
                'user1@test.com', 'user2@test.com', 'user3@test.com',
                'user4@test.com', 'user5@test.com', 'user6@test.com', 'user7@test.com'
    );
