package com.bizsync.backend.domain.approval.service;

import com.bizsync.backend.domain.approval.dto.request.ApprovalCreateRequestDTO;
import com.bizsync.backend.domain.approval.dto.request.ApprovalProcessRequestDTO;
import com.bizsync.backend.domain.approval.dto.request.ApprovalSummaryDTO;
import com.bizsync.backend.domain.approval.dto.response.ApprovalDetailDTO;
import com.bizsync.backend.domain.approval.entity.ApprovalDocument;
import com.bizsync.backend.domain.approval.entity.ApprovalLine;
import com.bizsync.backend.domain.approval.entity.ApprovalStatus;
import com.bizsync.backend.domain.approval.repository.ApprovalDocumentRepository;
import com.bizsync.backend.domain.approval.repository.ApprovalLineRepository;
import com.bizsync.backend.domain.notification.model.ApprovalNotification;
import com.bizsync.backend.domain.notification.model.Notification;
import com.bizsync.backend.domain.notification.service.NotificationService;
import com.bizsync.backend.domain.project.entity.Project;
import com.bizsync.backend.domain.project.repository.ProjectMemberRepository;
import com.bizsync.backend.domain.project.repository.ProjectRepository;
import com.bizsync.backend.domain.user.entity.User;
import com.bizsync.backend.domain.user.repository.UserRepository;
import com.bizsync.backend.global.common.exception.BusinessException;
import com.bizsync.backend.global.common.exception.ErrorCode;
import com.bizsync.backend.global.common.exception.ForbiddenException;
import com.bizsync.backend.global.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 결재 관련 비즈니스 로직을 처리하는 서비스
 *
 * <p>결재 문서 생성, 승인/반려 처리, 취소, 조회 등의 기능을 제공합니다.
 *
 * @author BizSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    /**
     * 결재 락 대기 시간 (초)
     */
    private static final long LOCK_WAIT_TIME = 5;
    /**
     * 결재 락 점유 시간 (초), 초과 시 자동 해제
     */
    private static final long LOCK_LEASE_TIME = 10;

    private final ApprovalDocumentRepository approvalDocumentRepository;
    private final ApprovalLineRepository approvalLineRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final RedissonClient redissonClient;

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
        List<User> approvers = validateApprovers(approverIds);
        Map<Long, User> approverMap = approvers.stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));
        createAndSaveApprovalLines(document, approverIds, approverMap);
    }

    private List<User> validateApprovers(List<Long> approverIds) {
        List<User> approvers = userRepository.findAllById(approverIds);
        if (approvers.size() != approverIds.size()) {
            throw new ResourceNotFoundException(ErrorCode.APPROVAL_APPROVER_NOT_FOUND);
        }
        return approvers;
    }

    private void createAndSaveApprovalLines(ApprovalDocument document, List<Long> approverIds, Map<Long, User> approverMap) {
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
     * <p>Redis 분산 락을 사용하여 동시성 이슈를 방지합니다.
     *
     * @param approverId 결재자 ID
     * @param documentId 결재 문서 ID
     * @param dto        결재 처리 요청 DTO (승인/반려 상태 및 코멘트)
     * @throws ForbiddenException 결재 권한이 없는 경우
     * @throws BusinessException  이미 처리된 결재이거나 이전 결재자가 미승인인 경우, 또는 락 획득 실패
     */
    public void processApproval(Long approverId, Long documentId, ApprovalProcessRequestDTO dto) {
        RLock lock = acquireApprovalLock(documentId);
        try {
            ApprovalRequestContext ctx = validateApprovalRequest(documentId, approverId);
            executeApprovalAction(ctx.document(), ctx.myLine(), dto);
        } finally {
            releaseApprovalLock(lock, documentId);
        }
    }

    /**
     * 결재 문서 처리용 분산 락을 획득합니다.
     *
     * @param documentId 결재 문서 ID
     * @return 획득한 락 (호출자가 finally에서 해제해야 함)
     * @throws BusinessException 락 획득 실패 시
     */
    private RLock acquireApprovalLock(Long documentId) {
        String lockKey = "approval:lock:" + documentId;
        RLock lock = redissonClient.getLock(lockKey);
        try {
            boolean acquired = lock.tryLock(LOCK_WAIT_TIME, LOCK_LEASE_TIME, TimeUnit.SECONDS);
            if (!acquired) {
                log.warn("Failed to acquire lock for approval documentId: {}", documentId);
                throw new BusinessException(ErrorCode.APPROVAL_LOCK_TIMEOUT);
            }
            log.info("Acquired lock for approval documentId: {}", documentId);
            return lock;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException(ErrorCode.APPROVAL_LOCK_INTERRUPTED);
        }
    }

    /**
     * 결재 문서 처리용 락을 해제합니다.
     */
    private void releaseApprovalLock(RLock lock, Long documentId) {
        if (lock != null && lock.isHeldByCurrentThread()) {
            lock.unlock();
            log.info("Released lock for approval documentId: {}", documentId);
        }
    }

    /**
     * 결재 요청을 검증하고 문서·결재선을 반환합니다.
     */
    private ApprovalRequestContext validateApprovalRequest(Long documentId, Long approverId) {
        ApprovalDocument document = approvalDocumentRepository.findByIdOrThrow(documentId);
        ApprovalLine myLine = getApprovalLine(document, approverId);
        validateApprovalLineStatus(myLine);
        validatePreviousApprovals(documentId, myLine);
        return new ApprovalRequestContext(document, myLine);
    }

    /**
     * 승인 또는 반려 액션을 실행합니다.
     */
    private void executeApprovalAction(ApprovalDocument document, ApprovalLine myLine, ApprovalProcessRequestDTO dto) {
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

            // 기안자 + 모든 결재자에게 대량 알림 발송 (Virtual Threads 사용)
            sendBulkApprovalCompleteNotification(document);
        }
    }

    /**
     * 결재 완료 시 기안자와 모든 결재자에게 대량 알림 발송
     *
     * <p>Java 21의 패턴 매칭(Pattern Matching)과 Virtual Thread를 활용합니다.
     * ApprovalNotification 레코드를 사용하여 타입 안전성을 보장하고,
     * Virtual Thread로 병렬 알림 발송을 수행합니다.
     *
     * @param document 승인 완료된 결재 문서
     */
    private void sendBulkApprovalCompleteNotification(ApprovalDocument document) {
        List<Long> allRecipients = collectAllRecipients(document);
        Notification notification = ApprovalNotification.approved(
                document.getDocumentId(),
                document.getDrafter().getName(),
                document.getTitle()
        );
        notificationService.sendBulk(allRecipients, notification);
    }

    private List<Long> collectAllRecipients(ApprovalDocument document) {
        Long drafterId = document.getDrafter().getUserId();
        List<Long> approverIds = approvalLineRepository.findByDocumentOrderBySequence(document)
                .stream()
                .map(line -> line.getApprover().getUserId())
                .toList();
        return removeDuplicateRecipients(drafterId, approverIds);
    }

    private List<Long> removeDuplicateRecipients(Long drafterId, List<Long> approverIds) {
        List<Long> result = new java.util.ArrayList<>(approverIds);
        if (!result.contains(drafterId)) {
            result.add(0, drafterId);
        }
        return result;
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
        validateDrafterOrApprover(userId, documentId, document);
        List<ApprovalLine> lines = approvalLineRepository.findByDocumentOrderBySequence(document);
        return ApprovalDetailDTO.from(document, lines);
    }

    /**
     * 사용자가 기안자 또는 결재선에 포함된 결재자인지 검증합니다.
     */
    private void validateDrafterOrApprover(Long userId, Long documentId, ApprovalDocument document) {
        boolean isDrafter = document.getDrafter().getUserId().equals(userId);
        boolean isApprover = approvalLineRepository.existsByDocumentAndApprover(documentId, userId);
        if (!isDrafter && !isApprover) {
            throw new ForbiddenException(ErrorCode.APPROVAL_VIEW_PERMISSION_DENIED);
        }
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
        // 비관적 락 제거: 분산 락이 이미 전체 결재 프로세스를 보호하므로 불필요
        Project project = projectRepository.findByIdOrThrow(document.getProject().getProjectId());

        try {
            project.spendBudget(document.getAmount());
        } catch (IllegalStateException e) {
            BigDecimal remaining = project.getTotalBudget().subtract(project.getUsedBudget());
            throw new BusinessException(ErrorCode.BUDGET_INSUFFICIENT,
                    String.format("프로젝트 예산이 부족합니다. (요청: %s원, 잔액: %s원)",
                            document.getAmount(), remaining));
        }
    }

    private record ApprovalRequestContext(ApprovalDocument document, ApprovalLine myLine) {
    }
}
