package com.bizsync.backend.global.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 결재 이벤트
 * 결재 요청, 승인, 반려, 취소 시 발행되는 이벤트
 *
 * @author BizSync Team
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ApprovalEvent extends EventMessage {

    /**
     * 결재 문서 ID
     */
    private Long approvalId;

    /**
     * 결재 문서 제목
     */
    private String approvalTitle;

    /**
     * 결재 요청자 ID
     */
    private Long requesterId;

    /**
     * 결재 요청자 이름
     */
    private String requesterName;

    /**
     * 현재 결재자 ID (승인/반려 시)
     */
    private Long approverId;

    /**
     * 현재 결재자 이름
     */
    private String approverName;

    /**
     * 결재 상태 (PENDING, APPROVED, REJECTED, CANCELED)
     */
    private String approvalStatus;

    /**
     * 결재 코멘트
     */
    private String comment;

    /**
     * 다음 결재자 ID (다음 결재 단계가 있는 경우)
     */
    private Long nextApproverId;

    public static ApprovalEvent createRequested(
            Long userId,
            Long projectId,
            Long approvalId,
            String approvalTitle,
            Long requesterId,
            String requesterName,
            Long nextApproverId
    ) {
        ApprovalEvent event = ApprovalEvent.builder()
                .userId(userId)
                .projectId(projectId)
                .eventType(EventType.APPROVAL_REQUESTED)
                .approvalId(approvalId)
                .approvalTitle(approvalTitle)
                .requesterId(requesterId)
                .requesterName(requesterName)
                .approvalStatus("PENDING")
                .nextApproverId(nextApproverId)
                .build();
        event.initEvent();
        return event;
    }

    public static ApprovalEvent createApproved(
            Long userId,
            Long projectId,
            Long approvalId,
            String approvalTitle,
            Long approverId,
            String approverName,
            String comment,
            Long nextApproverId
    ) {
        ApprovalEvent event = ApprovalEvent.builder()
                .userId(userId)
                .projectId(projectId)
                .eventType(EventType.APPROVAL_APPROVED)
                .approvalId(approvalId)
                .approvalTitle(approvalTitle)
                .approverId(approverId)
                .approverName(approverName)
                .approvalStatus("APPROVED")
                .comment(comment)
                .nextApproverId(nextApproverId)
                .build();
        event.initEvent();
        return event;
    }

    public static ApprovalEvent createRejected(
            Long userId,
            Long projectId,
            Long approvalId,
            String approvalTitle,
            Long approverId,
            String approverName,
            String comment
    ) {
        ApprovalEvent event = ApprovalEvent.builder()
                .userId(userId)
                .projectId(projectId)
                .eventType(EventType.APPROVAL_REJECTED)
                .approvalId(approvalId)
                .approvalTitle(approvalTitle)
                .approverId(approverId)
                .approverName(approverName)
                .approvalStatus("REJECTED")
                .comment(comment)
                .build();
        event.initEvent();
        return event;
    }

    public static ApprovalEvent createCanceled(
            Long userId,
            Long projectId,
            Long approvalId,
            String approvalTitle,
            Long requesterId,
            String requesterName
    ) {
        ApprovalEvent event = ApprovalEvent.builder()
                .userId(userId)
                .projectId(projectId)
                .eventType(EventType.APPROVAL_CANCELED)
                .approvalId(approvalId)
                .approvalTitle(approvalTitle)
                .requesterId(requesterId)
                .requesterName(requesterName)
                .approvalStatus("CANCELED")
                .build();
        event.initEvent();
        return event;
    }
}
