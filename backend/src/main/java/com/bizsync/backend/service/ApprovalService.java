package com.bizsync.backend.service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ForbiddenException;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.domain.entity.ApprovalDocument;
import com.bizsync.backend.domain.entity.ApprovalLine;
import com.bizsync.backend.domain.entity.ApprovalStatus;
import com.bizsync.backend.domain.entity.Project;
import com.bizsync.backend.domain.entity.User;
import com.bizsync.backend.domain.repository.ApprovalDocumentRepository;
import com.bizsync.backend.domain.repository.ApprovalLineRepository;
import com.bizsync.backend.domain.repository.ProjectRepository;
import com.bizsync.backend.domain.repository.UserRepository;
import com.bizsync.backend.dto.request.ApprovalCreateRequestDTO;
import com.bizsync.backend.dto.request.ApprovalProcessRequestDTO;
import com.bizsync.backend.dto.request.ApprovalSummaryDTO;
import com.bizsync.backend.dto.response.ApprovalDetailDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    private final ApprovalDocumentRepository approvalDocumentRepository;
    private final ApprovalLineRepository approvalLineRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ProjectRepository projectRepository;

    public Long createApproval(Long drafterId, ApprovalCreateRequestDTO dto) {
        User drafter = userRepository.findByIdOrThrow(drafterId);

        Project project = null;
        if (dto.projectId() != null) {
            project = projectRepository.findByIdOrThrow(dto.projectId());
        }

        ApprovalDocument document = ApprovalDocument.builder()
                .drafter(drafter)
                .project(project)
                .type(dto.type())
                .amount(dto.amount())
                .title(dto.title())
                .content(dto.content())
                .status(ApprovalStatus.PENDING)
                .build();

        ApprovalDocument savedDoc = approvalDocumentRepository.save(document);

        List<User> approvers = userRepository.findAllById(dto.approverIds());

        if (approvers.size() != dto.approverIds().size()) {
            throw new ResourceNotFoundException(ErrorCode.APPROVAL_APPROVER_NOT_FOUND);
        }

        Map<Long, User> approverMap = approvers.stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));

        int sequence = 1;
        for (Long approverId : dto.approverIds()) {
            User approver = approverMap.get(approverId);

            ApprovalLine line = ApprovalLine.builder()
                    .document(savedDoc)
                    .approver(approver)
                    .sequence(sequence++)
                    .status(ApprovalStatus.PENDING)
                    .build();

            approvalLineRepository.save(line);

            notificationService.sendApprovalRequestNotification(
                    savedDoc,
                    approver.getUserId(),
                    approver.getName(),
                    line.getSequence());
        }

        return savedDoc.getDocumentId();
    }

    public void cancelApproval(Long userId, Long documentId) {
        ApprovalDocument document = approvalDocumentRepository.findByIdOrThrow(documentId);

        if (!document.getDrafter().getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.APPROVAL_DRAFTER_ONLY);
        }

        if (document.getStatus() == ApprovalStatus.APPROVED) {
            throw new IllegalStateException("이미 최종 승인된 결재는 취소할 수 없습니다.");
        }
        if (document.getStatus() == ApprovalStatus.REJECTED) {
            throw new IllegalStateException("이미 반려된 결재는 취소할 수 없습니다.");
        }
        if (document.getStatus() == ApprovalStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 결재입니다.");
        }

        document.cancel();

        List<ApprovalLine> lines = approvalLineRepository.findByDocumentOrderBySequence(document);
        lines.forEach(ApprovalLine::cancel);
    }

    public void processApproval(Long approverId, Long documentId, ApprovalProcessRequestDTO dto) {
        ApprovalDocument document = approvalDocumentRepository.findByIdOrThrow(documentId);

        ApprovalLine myLine = approvalLineRepository
                .findByDocumentAndApproverEntity(document, approverId)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.APPROVAL_NO_PERMISSION));

        if (myLine.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 결재입니다.");
        }

        boolean hasUnapprovedPrevious = approvalLineRepository
                .existsByDocument_DocumentIdAndSequenceLessThanAndStatusNot(
                        documentId,
                        myLine.getSequence(),
                        ApprovalStatus.APPROVED);

        if (hasUnapprovedPrevious) {
            throw new IllegalStateException("이전 결재자가 아직 승인하지 않았습니다.");
        }

        if (dto.status() == ApprovalStatus.APPROVED) {
            myLine.approve(dto.comment());

            List<ApprovalLine> allLines = approvalLineRepository
                    .findByDocumentOrderBySequence(document);

            boolean allApproved = allLines.stream()
                    .allMatch(line -> line.getStatus() == ApprovalStatus.APPROVED);

            if (allApproved) {
                document.approve();

                if (document.isExpenseApproval()) {
                    deductBudget(document);
                }

                notificationService.sendApprovalCompleteNotification(document);
            }

        } else if (dto.status() == ApprovalStatus.REJECTED) {
            myLine.reject(dto.comment());
            document.reject();

            notificationService.sendApprovalRejectedNotification(document, dto.comment());
        }
    }

    @Transactional(readOnly = true)
    public ApprovalDetailDTO getApprovalDetail(Long userId, Long documentId) {
        ApprovalDocument document = approvalDocumentRepository.findByIdOrThrow(documentId);

        boolean isDrafter = document.getDrafter().getUserId().equals(userId);
        boolean isApprover = approvalLineRepository.existsByDocumentAndApprover(documentId, userId);
        if (!isDrafter && !isApprover) {
            throw new ForbiddenException(ErrorCode.APPROVAL_VIEW_PERMISSION_DENIED);
        }

        List<ApprovalLine> lines = approvalLineRepository.findByDocumentOrderBySequence(document);
        return ApprovalDetailDTO.from(document, lines);
    }

    @Transactional(readOnly = true)
    public Page<ApprovalSummaryDTO> getMyDrafts(Long userId, Pageable pageable) {
        return approvalDocumentRepository.findByDrafter_UserId(userId, pageable)
                .map(ApprovalSummaryDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<ApprovalSummaryDTO> getMyPendingApprovals(Long userId, Pageable pageable) {
        return approvalLineRepository.findByApprover_UserIdAndStatus(userId, ApprovalStatus.PENDING, pageable)
                .map(ApprovalSummaryDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<ApprovalSummaryDTO> getMyCompletedApprovals(Long userId, Pageable pageable) {
        return approvalLineRepository.findByApprover_UserIdAndStatusIn(
                userId,
                List.of(ApprovalStatus.APPROVED, ApprovalStatus.REJECTED),
                pageable).map(ApprovalSummaryDTO::from);
    }

    private void deductBudget(ApprovalDocument document) {
        Project project = projectRepository.findByIdForUpdateOrThrow(document.getProject().getProjectId());

        try {
            project.spendBudget(document.getAmount());
        } catch (IllegalStateException e) {
            throw new IllegalStateException(
                    "프로젝트 예산이 부족합니다. (요청: " + document.getAmount() +
                            "원, 잔액: " + project.getTotalBudget().subtract(project.getUsedBudget()) + "원)");
        }
    }
}
