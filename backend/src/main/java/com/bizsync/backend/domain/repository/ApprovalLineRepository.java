package com.bizsync.backend.domain.repository;

import com.bizsync.backend.domain.entity.ApprovalLine;
import com.bizsync.backend.domain.entity.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, Long> {
    // 1. 특정 문서에서 특정 유저의 결재선 찾기
    Optional<ApprovalLine> findByDocument_DocumentIdAndApprover_UserId(Long documentId, Long userId);

    // 2. 해당 문서의 전체 결재선 중 가장 큰 순서 번호 (마지막 순서 찾기용)
    @Query("SELECT COALESCE(MAX(al.sequence), 0) FROM ApprovalLine al WHERE al.document.documentId = :documentId")
    Integer findMaxSequence(@Param("documentId") Long documentId);

    // 3. 내 앞 순서(currentSequence - 1) 중 아직 승인 안 된(APPROVED가 아닌) 사람이 있는지 확인
    // 즉, 이게 true면 "아직 네 차례 아님"
    boolean existsByDocument_DocumentIdAndSequenceLessThanAndStatusNot(
            Long documentId, Integer sequence, ApprovalStatus status);

    // 결재 대김함 : 결재자가 나이고 내 상태가 PENDING인 것 조회
    Page<ApprovalLine> findByApprover_UserIdAndStatus(Long userId, ApprovalStatus status, Pageable pageable);
}