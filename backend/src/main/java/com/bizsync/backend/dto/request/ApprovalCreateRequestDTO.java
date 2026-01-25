package com.bizsync.backend.dto.request;

import com.bizsync.backend.common.exception.BusinessException;
import com.bizsync.backend.common.exception.ErrorCode;
import com.bizsync.backend.domain.entity.ApprovalType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ApprovalCreateRequestDTO(

        Long projectId,

        @NotNull(message = "결재 유형은 필수입니다.")
        ApprovalType type,

        @DecimalMin(value = "0.01", message = "금액은 0보다 커야 합니다.")
        BigDecimal amount,

        @NotBlank(message = "결재 제목은 필수입니다.")
        @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
        String title,

        @NotBlank(message = "결재 내용은 필수입니다.")
        String content,

        @NotEmpty(message = "결재자는 최소 1명 이상이어야 합니다.")
        List<Long> approverIds

) {
    /**
     * 비용 결재 전용 검증
     * - type이 EXPENSE일 때 projectId와 amount 필수 체크
     *
     * @throws BusinessException 검증 실패 시
     */
    public void validateExpenseApproval() {
        if (type == ApprovalType.EXPENSE) {
            if (projectId == null) {
                throw new BusinessException(ErrorCode.APPROVAL_EXPENSE_PROJECT_REQUIRED);
            }
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException(ErrorCode.APPROVAL_EXPENSE_AMOUNT_REQUIRED);
            }
        }
    }
}