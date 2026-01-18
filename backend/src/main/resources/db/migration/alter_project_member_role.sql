-- 안전 주의: 프로덕션에 적용 전에 백업 후 실행하세요.
-- 1) 현재 컬럼 타입 확인 (MySQL/MariaDB)
--    SHOW COLUMNS FROM project_member LIKE 'role';

-- 2) NULL 허용 여부 확인 후 필요시 NULL을 기본값으로 채우기
--    UPDATE project_member SET role = 'MEMBER' WHERE role IS NULL;

-- 3) role 컬럼을 충분한 길이의 VARCHAR로 변경 (예: 50)
ALTER TABLE project_member
  MODIFY COLUMN role VARCHAR(50);

-- (선택) 모든 값이 비어있지 않다면 NOT NULL로 변경
-- ALTER TABLE project_member
--   MODIFY COLUMN role VARCHAR(50) NOT NULL;

-- 확인: 변경 후 컬럼 타입 확인
-- SHOW COLUMNS FROM project_member LIKE 'role';
