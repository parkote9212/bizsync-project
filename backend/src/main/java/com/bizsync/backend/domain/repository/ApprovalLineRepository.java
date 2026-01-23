package com.bizsync.backend.domain.repository;

import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.domain.entity.ApprovalLine;
import com.bizsync.backend.domain.entity.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, Long> {
    /**
     * 특정 문서에서 특정 유저의 결재선 찾기 (documentId 사용)
     */
    @Query("SELECT al FROM ApprovalLine al WHERE al.document.documentId = :documentId AND al.approver.userId = :userId")
    Optional<ApprovalLine> findByDocumentAndApprover(
            @Param("documentId") Long documentId,
            @Param("userId") Long userId
    );

    /**
     * 특정 문서에서 특정 승인자의 결재선 찾기 (ApprovalDocument 엔티티 사용)
     */
    @Query("SELECT al FROM ApprovalLine al " +
            "WHERE al.document = :document " +
            "AND al.approver.userId = :approverId")
    Optional<ApprovalLine> findByDocumentAndApproverEntity(
            @Param("document") ApprovalDocument document,
            @Param("approverId") Long approverId
    );

    // 2. 해당 문서의 전체 결재선 중 가장 큰 순서 번호 (마지막 순서 찾기용)
    @Query("SELECT COALESCE(MAX(al.sequence), 0) FROM ApprovalLine al WHERE al.document.documentId = :documentId")
    Integer findMaxSequence(@Param("documentId") Long documentId);

    // 3. 내 앞 순서(currentSequence - 1) 중 아직 승인 안 된(APPROVED가 아닌) 사람이 있는지 확인
    // 즉, 이게 true면 "아직 네 차례 아님"
    boolean existsByDocument_DocumentIdAndSequenceLessThanAndStatusNot(
            Long documentId, Integer sequence, ApprovalStatus status);

    // 결재 대기함 : 결재자가 나이고 내 상태가 PENDING인 것 조회
    Page<ApprovalLine> findByApprover_UserIdAndStatus(Long userId, ApprovalStatus status, Pageable pageable);

    // 결재 완료함 : 결재자가 나이고 내 상태가 APPROVED 또는 REJECTED인 것 조회
    Page<ApprovalLine> findByApprover_UserIdAndStatusIn(Long userId, List<ApprovalStatus> statuses, Pageable pageable);

    // 특정 문서의 모든 결재선을 순서대로 조회
    @Query("SELECT al FROM ApprovalLine al " +
            "WHERE al.document = :document " +
            "ORDER BY al.sequence ASC")
    List<ApprovalLine> findByDocumentOrderBySequence(
            @Param("document") ApprovalDocument document
    );

    /**
     * 상세 조회 권한: 기안자 또는 결재선에 포함된 경우에만 조회 허용
     */
    @Query("SELECT COUNT(al) > 0 FROM ApprovalLine al WHERE al.document.documentId = :documentId AND al.approver.userId = :userId")
    boolean existsByDocumentAndApprover(
            @Param("documentId") Long documentId,
            @Param("userId") Long userId
    );

    long countByApprover_UserIdAndStatus(Long userId, ApprovalStatus status);
}
