package com.bizsync.backend.service;

import com.bizsync.backend.common.exception.BusinessException;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.common.exception.ForbiddenException;
import com.bizsync.backend.common.exception.ResourceNotFoundException;
import com.bizsync.backend.domain.entity.*;
import com.bizsync.backend.domain.repository.*;
import com.bizsync.backend.dto.request.ApprovalCreateRequestDTO;
import com.bizsync.backend.dto.request.ApprovalProcessRequestDTO;
import com.bizsync.backend.dto.request.ApprovalSummaryDTO;
import com.bizsync.backend.dto.response.ApprovalDetailDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 결재 관련 비즈니스 로직을 처리하는 서비스
 *
 * <p>결재 문서 생성, 승인/반려 처리, 취소, 조회 등의 기능을 제공합니다.
 *
 * @author BizSync Team
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    private final ApprovalDocumentRepository approvalDocumentRepository;
    private final ApprovalLineRepository approvalLineRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    /**
     * 결재 문서를 생성하고 결재선을 설정합니다.
     *
     * @param drafterId 기안자 ID
     * @param dto       결재 생성 요청 DTO
     * @return 생성된 결재 문서 ID
     * @throws ResourceNotFoundException 결재자가 존재하지 않는 경우
     * @throws BusinessException         비용 결재 시 기안자가 프로젝트 멤버가 아닌 경우
     */
    public Long createApproval(Long drafterId, ApprovalCreateRequestDTO dto) {
        User drafter = userRepository.findByIdOrThrow(drafterId);
        Project project = getProjectIfExists(dto.projectId());

        // 비용 결재 시 기안자가 프로젝트 멤버인지 검증
        if (project != null && !projectMemberRepository.existsByProjectAndUser(project.getProjectId(), drafterId)) {
            throw new BusinessException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
        }

        ApprovalDocument document = createApprovalDocument(drafter, project, dto);
        ApprovalDocument savedDoc = approvalDocumentRepository.save(document);

        createApprovalLines(savedDoc, dto.approverIds());

        return savedDoc.getDocumentId();
    }

    private Project getProjectIfExists(Long projectId) {
        if (projectId == null) {
            return null;
        }
        return projectRepository.findByIdOrThrow(projectId);
    }

    private ApprovalDocument createApprovalDocument(User drafter, Project project, ApprovalCreateRequestDTO dto) {
        return ApprovalDocument.builder()
                .drafter(drafter)
                .project(project)
                .type(dto.type())
                .amount(dto.amount())
                .title(dto.title())
                .content(dto.content())
                .status(ApprovalStatus.PENDING)
                .build();
    }

    private void createApprovalLines(ApprovalDocument document, List<Long> approverIds) {
        List<User> approvers = userRepository.findAllById(approverIds);

        if (approvers.size() != approverIds.size()) {
            throw new ResourceNotFoundException(ErrorCode.APPROVAL_APPROVER_NOT_FOUND);
        }

        Map<Long, User> approverMap = approvers.stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));

        int sequence = 1;
        for (Long approverId : approverIds) {
            User approver = approverMap.get(approverId);
            ApprovalLine line = createApprovalLine(document, approver, sequence++);
            approvalLineRepository.save(line);
            sendApprovalRequestNotification(document, approver, line.getSequence());
        }
    }

    private ApprovalLine createApprovalLine(ApprovalDocument document, User approver, int sequence) {
        return ApprovalLine.builder()
                .document(document)
                .approver(approver)
                .sequence(sequence)
                .status(ApprovalStatus.PENDING)
                .build();
    }

    private void sendApprovalRequestNotification(ApprovalDocument document, User approver, Integer sequence) {
        notificationService.sendApprovalRequestNotification(
                document,
                approver.getUserId(),
                approver.getName(),
                sequence
        );
    }

    /**
     * 결재 문서를 취소합니다.
     *
     * <p>기안자만 취소할 수 있으며, 이미 승인되거나 반려된 결재는 취소할 수 없습니다.
     *
     * @param userId     사용자 ID (기안자 여부 확인용)
     * @param documentId 취소할 결재 문서 ID
     * @throws ForbiddenException 기안자가 아닌 경우
     * @throws BusinessException  이미 승인/반려/취소된 결재인 경우
     */
    public void cancelApproval(Long userId, Long documentId) {
        ApprovalDocument document = approvalDocumentRepository.findByIdOrThrow(documentId);

        validateDrafterPermission(userId, document);
        validateCancellableStatus(document);

        document.cancel();
        cancelAllApprovalLines(document);
    }

    private void validateDrafterPermission(Long userId, ApprovalDocument document) {
        if (!document.getDrafter().getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.APPROVAL_DRAFTER_ONLY);
        }
    }

    private void validateCancellableStatus(ApprovalDocument document) {
        ApprovalStatus status = document.getStatus();
        if (status == ApprovalStatus.APPROVED) {
            throw new BusinessException(ErrorCode.APPROVAL_ALREADY_APPROVED);
        }
        if (status == ApprovalStatus.REJECTED) {
            throw new BusinessException(ErrorCode.APPROVAL_ALREADY_REJECTED);
        }
        if (status == ApprovalStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.APPROVAL_ALREADY_CANCELLED);
        }
    }

    private void cancelAllApprovalLines(ApprovalDocument document) {
        List<ApprovalLine> lines = approvalLineRepository.findByDocumentOrderBySequence(document);
        lines.forEach(ApprovalLine::cancel);
    }

    /**
     * 결재를 승인하거나 반려 처리합니다.
     *
     * <p>이전 결재자가 모두 승인한 경우에만 처리할 수 있으며,
     * 모든 결재자가 승인하면 문서가 최종 승인됩니다.
     *
     * @param approverId 결재자 ID
     * @param documentId 결재 문서 ID
     * @param dto        결재 처리 요청 DTO (승인/반려 상태 및 코멘트)
     * @throws ForbiddenException 결재 권한이 없는 경우
     * @throws BusinessException  이미 처리된 결재이거나 이전 결재자가 미승인인 경우
     */
    public void processApproval(Long approverId, Long documentId, ApprovalProcessRequestDTO dto) {
        ApprovalDocument document = approvalDocumentRepository.findByIdOrThrow(documentId);
        ApprovalLine myLine = getApprovalLine(document, approverId);

        validateApprovalLineStatus(myLine);
        validatePreviousApprovals(documentId, myLine);

        if (dto.status() == ApprovalStatus.APPROVED) {
            processApprovalAction(document, myLine, dto.comment());
        } else if (dto.status() == ApprovalStatus.REJECTED) {
            processRejectionAction(document, myLine, dto.comment());
        }
    }

    private ApprovalLine getApprovalLine(ApprovalDocument document, Long approverId) {
        return approvalLineRepository
                .findByDocumentAndApproverEntity(document, approverId)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.APPROVAL_NO_PERMISSION));
    }

    private void validateApprovalLineStatus(ApprovalLine line) {
        if (line.getStatus() != ApprovalStatus.PENDING) {
            throw new BusinessException(ErrorCode.APPROVAL_ALREADY_PROCESSED);
        }
    }

    private void validatePreviousApprovals(Long documentId, ApprovalLine myLine) {
        boolean hasUnapprovedPrevious = approvalLineRepository
                .existsByDocument_DocumentIdAndSequenceLessThanAndStatusNot(
                        documentId,
                        myLine.getSequence(),
                        ApprovalStatus.APPROVED);

        if (hasUnapprovedPrevious) {
            throw new BusinessException(ErrorCode.APPROVAL_SEQUENCE_VIOLATION);
        }
    }

    private void processApprovalAction(ApprovalDocument document, ApprovalLine line, String comment) {
        line.approve(comment);

        if (isAllApproved(document)) {
            document.approve();

            if (document.isExpenseApproval()) {
                deductBudget(document);
            }

            notificationService.sendApprovalCompleteNotification(document);
        }
    }

    private void processRejectionAction(ApprovalDocument document, ApprovalLine line, String comment) {
        line.reject(comment);
        document.reject();
        notificationService.sendApprovalRejectedNotification(document, comment);
    }

    private boolean isAllApproved(ApprovalDocument document) {
        List<ApprovalLine> allLines = approvalLineRepository.findByDocumentOrderBySequence(document);
        return allLines.stream()
                .allMatch(line -> line.getStatus() == ApprovalStatus.APPROVED);
    }

    /**
     * 결재 문서 상세 정보를 조회합니다.
     *
     * <p>기안자 또는 결재자만 조회할 수 있습니다.
     *
     * @param userId     사용자 ID (권한 확인용)
     * @param documentId 조회할 결재 문서 ID
     * @return 결재 상세 정보 DTO
     * @throws ForbiddenException 기안자도 결재자도 아닌 경우
     */
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

    /**
     * 사용자가 기안한 결재 문서 목록을 조회합니다.
     *
     * @param userId   사용자 ID
     * @param pageable 페이지 정보
     * @return 기안한 결재 문서 목록 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<ApprovalSummaryDTO> getMyDrafts(Long userId, Pageable pageable) {
        return approvalDocumentRepository.findByDrafter_UserId(userId, pageable)
                .map(ApprovalSummaryDTO::from);
    }

    /**
     * 사용자에게 대기 중인 결재 목록을 조회합니다.
     *
     * @param userId   사용자 ID
     * @param pageable 페이지 정보
     * @return 대기 중인 결재 목록 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<ApprovalSummaryDTO> getMyPendingApprovals(Long userId, Pageable pageable) {
        return approvalLineRepository.findByApprover_UserIdAndStatus(userId, ApprovalStatus.PENDING, pageable)
                .map(ApprovalSummaryDTO::from);
    }

    /**
     * 사용자가 처리한 결재 목록을 조회합니다 (승인/반려 완료).
     *
     * @param userId   사용자 ID
     * @param pageable 페이지 정보
     * @return 처리 완료된 결재 목록 (페이징)
     */
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
            BigDecimal remaining = project.getTotalBudget().subtract(project.getUsedBudget());
            throw new BusinessException(ErrorCode.BUDGET_INSUFFICIENT,
                    String.format("프로젝트 예산이 부족합니다. (요청: %s원, 잔액: %s원)",
                            document.getAmount(), remaining));
        }
    }
}
