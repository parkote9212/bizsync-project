package com.bizsync.backend.domain.approval.repository;

import com.bizsync.backend.domain.approval.entity.ApprovalDocument;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalDocumentRepository extends JpaRepository<ApprovalDocument, Long> {
    // 내 기안함
    Page<ApprovalDocument> findByDrafter_UserId(Long userId, Pageable pageable);

    /**
     * 사용자가 관여한 결재 문서 전체 (기안 + 결재선 참여) 조회
     */
    @Query(
            value = "SELECT DISTINCT d FROM ApprovalDocument d " +
                    "LEFT JOIN ApprovalLine l ON l.document = d AND l.approver.userId = :userId " +
                    "WHERE d.drafter.userId = :userId OR l.id IS NOT NULL",
            countQuery = "SELECT COUNT(DISTINCT d) FROM ApprovalDocument d " +
                    "LEFT JOIN ApprovalLine l ON l.document = d AND l.approver.userId = :userId " +
                    "WHERE d.drafter.userId = :userId OR l.id IS NOT NULL"
    )
    Page<ApprovalDocument> findMyApprovals(@Param("userId") Long userId, Pageable pageable);

    // 프로젝트에 속한 결재 문서 조회
    List<ApprovalDocument> findByProject_ProjectId(Long projectId);

    /**
     * ID로 결재 문서 조회 (없으면 예외 발생)
     */
    default ApprovalDocument findByIdOrThrow(Long documentId) {
        return findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.APPROVAL_NOT_FOUND_ALT));
    }
}
