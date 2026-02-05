package com.bizsync.backend.domain.notification.model;

/**
 * 프로젝트 알림 레코드
 *
 * <p>프로젝트 관련 알림을 표현하는 불변 객체입니다.
 *
 * <p>사용 예시:
 * <pre>
 * var notification = new ProjectNotification(
 *     456L,                    // projectId
 *     "CREATED",               // event
 *     "신규 ERP 구축 프로젝트"  // projectName
 * );
 * </pre>
 *
 * @param projectId   프로젝트 ID
 * @param event       프로젝트 이벤트 (CREATED, UPDATED, COMPLETED 등)
 * @param projectName 프로젝트 이름
 * @author BizSync Team
 */
public record ProjectNotification(
        Long projectId,
        String event,
        String projectName
) implements Notification {

    /**
     * 프로젝트 생성 알림
     */
    public static ProjectNotification created(Long projectId, String projectName) {
        return new ProjectNotification(projectId, "CREATED", projectName);
    }

    /**
     * 프로젝트 완료 알림
     */
    public static ProjectNotification completed(Long projectId, String projectName) {
        return new ProjectNotification(projectId, "COMPLETED", projectName);
    }

    @Override
    public Long targetId() {
        return projectId;
    }

    @Override
    public String type() {
        return "PROJECT";
    }
}
