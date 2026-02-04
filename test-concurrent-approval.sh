#!/bin/bash

# ============================================
# 결재 동시성 테스트 스크립트
# ============================================

# 설정
DOCUMENT_ID=${1:-1}  # 첫 번째 인자로 document_id 받기 (기본값: 1)
TOKEN=${2:-"YOUR_JWT_TOKEN_HERE"}  # 두 번째 인자로 JWT 토큰 받기
CONCURRENT_REQUESTS=10  # 동시 요청 개수

echo "========================================="
echo "결재 동시성 테스트"
echo "========================================="
echo "Document ID: $DOCUMENT_ID"
echo "동시 요청 수: $CONCURRENT_REQUESTS"
echo "========================================="

# 백그라운드로 동시 요청 전송
for i in $(seq 1 $CONCURRENT_REQUESTS); do
    curl -X POST "http://localhost:8080/api/approvals/${DOCUMENT_ID}/process" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "status": "APPROVED",
        "comment": "동시성 테스트 승인 #'$i'"
      }' \
      -w "\nRequest $i - HTTP Status: %{http_code}\n" \
      -s &
done

# 모든 백그라운드 작업 완료 대기
wait

echo "========================================="
echo "테스트 완료! DB에서 결과 확인:"
echo "========================================="
echo ""
echo "SELECT al.line_id, al.status, al.comment, al.updated_at"
echo "FROM approval_line al"
echo "WHERE al.document_id = $DOCUMENT_ID"
echo "ORDER BY al.updated_at DESC;"
echo ""
echo "SELECT ad.document_id, ad.status, ad.updated_at"
echo "FROM approval_document ad"
echo "WHERE ad.document_id = $DOCUMENT_ID;"
