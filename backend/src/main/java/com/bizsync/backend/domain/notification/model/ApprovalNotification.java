package com.bizsync.backend.domain.notification.model;

/**
 * 결재 알림 레코드
 *
 * <p>결재 관련 알림을 표현하는 불변 객체입니다.
 * Java 21의 Record를 사용하여 간결하고 타입 안전한 데이터 클래스를 제공합니다.
 *
 * <p>사용 예시:
 * <pre>
 * var notification = new ApprovalNotification(
 *     123L,              // documentId
 *     "APPROVED",        // action
 *     "김철수",          // drafterName
 *     "출장비 지출 건"   // documentTitle
 * );
 * </pre>
 *
 * @param documentId    결재 문서 ID
 * @param action        결재 액션 (APPROVED, REJECTED, REQUESTED)
 * @param drafterName   기안자 이름
 * @param documentTitle 문서 제목
 * @author BizSync Team
 */
public record ApprovalNotification(
        Long documentId,
        String action,
        String drafterName,
        String documentTitle
) implements Notification {

    /**
     * 결재 승인 완료 알림 생성
     */
    public static ApprovalNotification approved(Long documentId, String drafterName, String documentTitle) {
        return new ApprovalNotification(documentId, "APPROVED", drafterName, documentTitle);
    }

    /**
     * 결재 반려 알림 생성
     */
    public static ApprovalNotification rejected(Long documentId, String drafterName, String documentTitle) {
        return new ApprovalNotification(documentId, "REJECTED", drafterName, documentTitle);
    }

    /**
     * 결재 요청 알림 생성
     */
    public static ApprovalNotification requested(Long documentId, String drafterName, String documentTitle) {
        return new ApprovalNotification(documentId, "REQUESTED", drafterName, documentTitle);
    }

    @Override
    public Long targetId() {
        return documentId;
    }

    @Override
    public String type() {
        return "APPROVAL";
    }
}
