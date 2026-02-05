package com.bizsync.backend.domain.approval.repository;

import com.bizsync.backend.domain.approval.entity.ApprovalDocument;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalDocumentRepository extends JpaRepository<ApprovalDocument, Long> {
    // 내 기안함
    Page<ApprovalDocument> findByDrafter_UserId(Long userId, Pageable pageable);

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
