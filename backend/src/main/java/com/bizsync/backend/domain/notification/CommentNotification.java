package com.bizsync.backend.domain.notification;

/**
 * Comment Notification Record
 * 
 * <p>댓글 관련 알림을 표현하는 불변 객체입니다.
 * 
 * <p>사용 예시:
 * <pre>
 * var notification = new CommentNotification(
 *     789L,               // commentId
 *     "이영희",           // commenterName
 *     "좋은 의견입니다."  // content
 * );
 * </pre>
 * 
 * @param commentId      댓글 ID
 * @param commenterName  댓글 작성자 이름
 * @param content        댓글 내용
 * 
 * @author BizSync Team
 */
public record CommentNotification(
    Long commentId,
    String commenterName,
    String content
) implements Notification {
    
    @Override
    public Long targetId() {
        return commentId;
    }
    
    @Override
    public String type() {
        return "COMMENT";
    }
    
    /**
     * 새 댓글 알림 생성
     */
    public static CommentNotification newComment(Long commentId, String commenterName, String content) {
        return new CommentNotification(commentId, commenterName, content);
    }
}
