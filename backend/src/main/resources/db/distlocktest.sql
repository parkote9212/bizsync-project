-- approver를 user_id=2로 변경
UPDATE approval_line
SET approver_id = 2
WHERE document_id = (SELECT document_id
                     FROM approval_document
                     WHERE title = '테스트 결재 문서'
                     ORDER BY document_id DESC
                     LIMIT 1);

-- 확인
SELECT ad.document_id,
       ad.title,
       ad.status as doc_status,
       al.id,
       al.status as line_status,
       u.user_id,
       u.email   as approver_email,
       u.name    as approver_name
FROM approval_document ad
         JOIN approval_line al ON ad.document_id = al.document_id
         JOIN users u ON al.approver_id = u.user_id
WHERE ad.title = '테스트 결재 문서'
ORDER BY ad.document_id DESC
LIMIT 1;

-- 결재선 상태 (정확히 1개만 APPROVED여야 함)
SELECT al.id,
       al.status,
       al.comment,
       al.approved_at,
       al.updated_at
FROM approval_line al
WHERE al.document_id = 20
ORDER BY al.updated_at DESC;

-- 결재 문서 상태 (APPROVED여야 함)
SELECT ad.document_id,
       ad.status,
       ad.updated_at
FROM approval_document ad
WHERE ad.document_id = 20;