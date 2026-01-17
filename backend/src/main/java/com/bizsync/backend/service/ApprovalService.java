package com.bizsync.backend.service;

import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.domain.entity.ApprovalLine;
import com.bizsync.backend.domain.entity.ApprovalStatus;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.ApprovalDocumentRepository;
import com.bizsync.backend.domain.repository.ApprovalLineRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.ApprovalCreateRequestDTO;
import com.bizsync.backend.dto.request.ApprovalProcessRequestDTO;
import com.bizsync.backend.dto.request.ApprovalSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    private final ApprovalDocumentRepository approvalDocumentRepository;
    private final ApprovalLineRepository approvalLineRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * 기안 상신 (문서 생성 + 결재선 등록)
     */
    public Long createApproval(Long drafterId, ApprovalCreateRequestDTO dto) {
        User drafter = userRepository.findById(drafterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        ApprovalDocument document = ApprovalDocument.builder()
                .drafter(drafter)
                .title(dto.title())
                .content(dto.content())
                .status(ApprovalStatus.PENDING) // 기본 상태: 진행 중
                .build();

        ApprovalDocument savedDoc = approvalDocumentRepository.save(document);

        List<User> approvers = userRepository.findAllById(dto.approverIds());

        if (approvers.size() != dto.approverIds().size()) {
            throw new IllegalArgumentException("존재하지 않는 결재자가 포함되어 있습니다.");
        }


        Map<Long, User> approverMap = approvers.stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));


        int sequence = 1;
        for (Long approverId : dto.approverIds()) {
            User approver = approverMap.get(approverId);

            ApprovalLine line = ApprovalLine.builder()
                    .document(savedDoc)
                    .approver(approver)
                    .sequence(sequence++) // 1부터 1씩 증가
                    .status(ApprovalStatus.PENDING) // 아직 결재 안 함
                    .build();

            approvalLineRepository.save(line);
        }

        return savedDoc.getDocumentId();
    }

    /**
     * 결재 처리 (승인 또는 반려)
     */
    public void processApproval(Long documentId, Long approverId, ApprovalProcessRequestDTO dto) {
        //내 결제선 찾기
        ApprovalLine myLine = approvalLineRepository.findByDocument_DocumentIdAndApprover_UserId(documentId, approverId)
                .orElseThrow(() -> new IllegalArgumentException("결재 권한이 없습니다."));

        // 결재상태 확인
        if (myLine.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("결재할 수 없는 문서 상태입니다.");
        }

        // 문서 상태 확인
        if (myLine.getDocument().getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("결재할 수 없는 문서 상태입니다.");
        }

        // 순서 체크
        boolean isNotMyTurn = approvalLineRepository.existsByDocument_DocumentIdAndSequenceLessThanAndStatusNot(
                documentId, myLine.getSequence(), ApprovalStatus.APPROVED);

        if (isNotMyTurn) {
            throw new IllegalArgumentException("이전 결재자가 아직 승인하지 않았습니다.");
        }

        if (dto.status() == ApprovalStatus.REJECTED) {
            myLine.reject(dto.comment());
            Long drafterId = myLine.getDocument().getDrafter().getUserId();
            notificationService.sendToUser(drafterId, "문서가 반려되었습니다: " + dto.comment(), documentId);
        } else if (dto.status() == ApprovalStatus.APPROVED) {
            myLine.approve(dto.comment());

            int maxSequence = approvalLineRepository.findMaxSequence(documentId);

            if (myLine.getSequence() == maxSequence) {
                myLine.getDocument().approve();
                Long drafterId = myLine.getDocument().getDrafter().getUserId();
                notificationService.sendToUser(drafterId, "문서가 최종 승인되었습니다!", documentId);
            }
        } else {
            throw new IllegalArgumentException("잘못된 결재 상태입니다.");
        }
    }

    /**
     * 내 기안함 조회
     */
    @Transactional(readOnly = true)
    public Page<ApprovalSummaryDTO> getMyDrafts(Long userId, Pageable pageable) {
        return approvalDocumentRepository.findByDrafter_UserId(userId, pageable)
                .map(ApprovalSummaryDTO::from);
    }

    /**
     * 내 결재 대기함
     */
    @Transactional(readOnly = true)
    public Page<ApprovalSummaryDTO> getMyPendingApprovals(Long userId, Pageable pageable) {
        return approvalLineRepository.findByApprover_UserIdAndStatus(userId, ApprovalStatus.PENDING, pageable)
                .map(ApprovalSummaryDTO::from);
    }
}