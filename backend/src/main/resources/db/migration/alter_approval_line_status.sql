-- approval_line 테이블의 status 컬럼 길이 확장
-- CANCELLED(9글자)를 저장하기 위해 VARCHAR(20)으로 변경

ALTER TABLE approval_line
MODIFY COLUMN status VARCHAR(20) NOT NULL;
