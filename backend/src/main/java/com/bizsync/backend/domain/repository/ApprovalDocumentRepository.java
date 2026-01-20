package com.bizsync.backend.domain.repository;

import com.bizsync.backend.domain.entity.ApprovalDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalDocumentRepository extends JpaRepository<ApprovalDocument, Long> {
    // 내 기안함
    Page<ApprovalDocument> findByDrafter_UserId(Long userId, Pageable pageable);
}