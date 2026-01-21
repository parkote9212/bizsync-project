package com.bizsync.backend.service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * 기안 상신 (문서 생성 + 결재선 등록)
     */
    public Long createApproval(Long drafterId, ApprovalCreateRequestDTO dto) {
        // 기안자 조회
        User drafter = userRepository.findById(drafterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 프로젝트 조회
        Project project = null;
        if (dto.projectId() != null) {
            project = projectRepository.findById(dto.projectId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));
        }

        // 결재문서 생성
        ApprovalDocument document = ApprovalDocument.builder()
                .drafter(drafter)
                .project(project)
                .type(dto.type())
                .amount(dto.amount())
                .title(dto.title())
                .content(dto.content())
                .status(ApprovalStatus.PENDING) // 기본 상태: 진행 중
                .build();

        ApprovalDocument savedDoc = approvalDocumentRepository.save(document);

        // 결재자 조회
        List<User> approvers = userRepository.findAllById(dto.approverIds());

        if (approvers.size() != dto.approverIds().size()) {
            throw new IllegalArgumentException("존재하지 않는 결재자가 포함되어 있습니다.");
        }

        // 결재선 생성
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

            // 기안 상신 시 결재자에게 알림 (1차, 2차, … N차 결재자)
            notificationService.sendApprovalRequestNotification(
                    savedDoc,
                    approver.getUserId(),
                    approver.getName(),
                    line.getSequence());
        }

        return savedDoc.getDocumentId();
    }

    /**
     * 결재 취소 (기안자만 가능, 최종 승인/반려 전까지 가능)
     */
    public void cancelApproval(Long userId, Long documentId) {
        // 1. 결재 문서 조회
        ApprovalDocument document = approvalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 결재 문서입니다."));

        // 2. 기안자인지 확인
        if (!document.getDrafter().getUserId().equals(userId)) {
            throw new IllegalArgumentException("기안자만 결재를 취소할 수 있습니다.");
        }

        // 3. 최종 승인 또는 반려된 문서는 취소 불가
        if (document.getStatus() == ApprovalStatus.APPROVED) {
            throw new IllegalStateException("이미 최종 승인된 결재는 취소할 수 없습니다.");
        }
        if (document.getStatus() == ApprovalStatus.REJECTED) {
            throw new IllegalStateException("이미 반려된 결재는 취소할 수 없습니다.");
        }
        if (document.getStatus() == ApprovalStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 결재입니다.");
        }

        // 4. 결재 취소 처리
        document.cancel();

        // 5. 모든 결재선 상태를 CANCELLED로 변경
        List<ApprovalLine> lines = approvalLineRepository.findByDocumentOrderBySequence(document);
        lines.forEach(ApprovalLine::cancel);
    }

    /**
     * 결재 처리 (승인 또는 반려)
     */
    public void processApproval(Long approverId, Long documentId, ApprovalProcessRequestDTO dto) {

        // 1. 결재 문서 조회
        ApprovalDocument document = approvalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 결재 문서입니다."));

        // 2. 내가 결재해야 하는 문서인지 확인
        ApprovalLine myLine = approvalLineRepository
                .findByDocumentAndApprover(document, approverId)
                .orElseThrow(() -> new IllegalArgumentException("결재 권한이 없습니다."));

        // 3. 이미 처리된 결재인지 확인
        if (myLine.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 결재입니다.");
        }

        // 4. 순서 검증 (이전 결재자가 모두 승인했는지 확인)
        boolean hasUnapprovedPrevious = approvalLineRepository
                .existsByDocument_DocumentIdAndSequenceLessThanAndStatusNot(
                        documentId,
                        myLine.getSequence(),
                        ApprovalStatus.APPROVED);

        if (hasUnapprovedPrevious) {
            throw new IllegalStateException("이전 결재자가 아직 승인하지 않았습니다.");
        }

        // 4. 승인 또는 반려 처리
        if (dto.status() == ApprovalStatus.APPROVED) {
            myLine.approve(dto.comment());

            // 5. 모든 결재선이 승인되었는지 확인
            List<ApprovalLine> allLines = approvalLineRepository
                    .findByDocumentOrderBySequence(document);

            boolean allApproved = allLines.stream()
                    .allMatch(line -> line.getStatus() == ApprovalStatus.APPROVED);

            if (allApproved) {
                // 최종 승인 → 문서 상태 변경 + 예산 차감
                document.approve();

                // 비용 결재인 경우 예산 차감 (Lock 적용!)
                if (document.isExpenseApproval()) {
                    deductBudget(document);
                }

                // 알림 발송
                notificationService.sendApprovalCompleteNotification(document);
            }

        } else if (dto.status() == ApprovalStatus.REJECTED) {
            // 반려 처리
            myLine.reject(dto.comment());
            document.reject();

            // 알림 발송
            notificationService.sendApprovalRejectedNotification(document, dto.comment());
        }
    }

    /**
     * 결재 상세 조회 (기안자 또는 결재선에 포함된 사용자만 가능)
     */
    @Transactional(readOnly = true)
    public ApprovalDetailDTO getApprovalDetail(Long userId, Long documentId) {
        ApprovalDocument document = approvalDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 결재 문서입니다."));

        // 권한: 기안자이거나, 결재선에 포함된 경우
        boolean isDrafter = document.getDrafter().getUserId().equals(userId);
        boolean isApprover = approvalLineRepository.existsByDocument_DocumentIdAndApprover_UserId(documentId, userId);
        if (!isDrafter && !isApprover) {
            throw new IllegalArgumentException("해당 결재 문서를 조회할 권한이 없습니다.");
        }

        List<ApprovalLine> lines = approvalLineRepository.findByDocumentOrderBySequence(document);
        return ApprovalDetailDTO.from(document, lines);
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

    /**
     * 내 결재 완료함 (내가 승인 또는 반려한 결재)
     */
    @Transactional(readOnly = true)
    public Page<ApprovalSummaryDTO> getMyCompletedApprovals(Long userId, Pageable pageable) {
        return approvalLineRepository.findByApprover_UserIdAndStatusIn(
                userId,
                List.of(ApprovalStatus.APPROVED, ApprovalStatus.REJECTED),
                pageable).map(ApprovalSummaryDTO::from);
    }

    /**
     * 예산 차감 (Pessimistic Lock 적용)
     *
     * @param document 승인된 결재 문서
     * @throws IllegalStateException 예산 부족 시
     */
    private void deductBudget(ApprovalDocument document) {
        // FOR UPDATE 락을 걸고 프로젝트 조회
        Project project = projectRepository.findByIdForUpdate(document.getProject().getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        // 예산 차감 (락이 걸려있어 안전)
        try {
            project.spendBudget(document.getAmount());
            // JPA dirty checking으로 자동 UPDATE

        } catch (IllegalStateException e) {
            // 예산 부족 시 예외 발생 → 트랜잭션 롤백
            throw new IllegalStateException(
                    "프로젝트 예산이 부족합니다. (요청: " + document.getAmount() +
                            "원, 잔액: " + project.getTotalBudget().subtract(project.getUsedBudget()) + "원)");
        }
    }
}
