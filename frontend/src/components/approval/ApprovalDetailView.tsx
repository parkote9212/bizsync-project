import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import type { ApprovalDetail } from "../../types/approval";
import { ApprovalStatus } from "../../types/approval";
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, getTypeLabel } from "../../utils/approval";

/**
 * 현재 사용자가 다음 결재자인지 확인
 * 
 * @param {ApprovalDetail | null} detail - 결재 상세 정보
 * @param {string | null | undefined} currentUserName - 현재 사용자 이름
 * @returns {boolean} 현재 사용자가 다음 결재자인지 여부
 */
const isCurrentUserNextApprover = (
  detail: ApprovalDetail | null,
  currentUserName: string | null | undefined
): boolean => {
  if (!detail || !currentUserName) return false;

  // 현재 사용자의 결재선 찾기
  const userLine = detail.approvalLines.find(
    (line) => line.approverName === currentUserName
  );

  if (!userLine) return false;

  // 현재 사용자의 결재선이 PENDING 상태가 아니면 false
  if (userLine.status !== ApprovalStatus.PENDING) return false;

  // 현재 사용자의 sequence보다 작은 모든 결재선이 APPROVED 상태인지 확인
  const previousLines = detail.approvalLines.filter(
    (line) => line.sequence < userLine.sequence
  );

  // 이전 결재선이 모두 APPROVED 상태여야 함
  return previousLines.every((line) => line.status === ApprovalStatus.APPROVED);
};

interface ApprovalDetailViewProps {
  open: boolean;
  loading: boolean;
  data: ApprovalDetail | null;
  tabValue: number;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  currentUserName?: string | null;
}

/**
 * 결재 상세 보기 컴포넌트
 *
 * <p>결재 문서의 상세 정보를 표시하는 다이얼로그입니다.
 * 결재선, 내용, 상태 등을 확인할 수 있으며, 권한에 따라 승인/반려/취소 버튼을 제공합니다.
 *
 * @component
 * @param {ApprovalDetailViewProps} props - ApprovalDetailView 컴포넌트 props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {boolean} props.loading - 로딩 상태
 * @param {ApprovalDetail|null} props.data - 결재 상세 데이터
 * @param {number} props.tabValue - 현재 탭 인덱스 (0: 기안함, 1: 대기함, 2: 완료함)
 * @param {Function} props.onClose - 다이얼로그를 닫을 때 호출되는 함수
 * @param {Function} [props.onApprove] - 승인 버튼 클릭 시 호출되는 함수
 * @param {Function} [props.onReject] - 반려 버튼 클릭 시 호출되는 함수
 * @param {Function} [props.onCancel] - 취소 버튼 클릭 시 호출되는 함수
 */
export const ApprovalDetailView: React.FC<ApprovalDetailViewProps> = ({
  open,
  loading,
  data,
  tabValue,
  onClose,
  onApprove,
  onReject,
  onCancel,
  currentUserName,
}) => {
  // 현재 사용자가 다음 결재자인지 확인
  const canApprove = isCurrentUserNextApprover(data, currentUserName ?? null);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{data?.title || "결재 상세"}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : data ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                기안자: {data.drafterName} | 부서: {data.department} | 기안일:{" "}
                {formatDate(data.createdAt)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                유형: {getTypeLabel(data.type)} | 상태:{" "}
                <Chip
                  label={getStatusLabel(data.status)}
                  color={getStatusColor(data.status)}
                  size="small"
                />
              </Typography>
            </Grid>
            {data.amount && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">
                  금액: {formatCurrency(data.amount.toString())}원
                </Typography>
              </Grid>
            )}
            {data.approvalLines.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  결재선
                </Typography>
                <Stepper orientation="vertical">
                  {data.approvalLines.map((line) => (
                    <Step key={line.sequence} completed={line.status === ApprovalStatus.APPROVED}>
                      <StepLabel>
                        {line.sequence}차 승인자: {line.approverName} (
                        {getStatusLabel(line.status)})
                      </StepLabel>
                      {line.comment && (
                        <Typography variant="body2" color="text.secondary">
                          의견: {line.comment}
                        </Typography>
                      )}
                    </Step>
                  ))}
                </Stepper>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                내용
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <Typography>{data.content}</Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>

        {/* 기안자: PENDING 상태일 때 취소 버튼 */}
        {data?.status === ApprovalStatus.PENDING && tabValue === 0 && onCancel && (
          <Button color="error" variant="outlined" onClick={onCancel}>
            결재 취소
          </Button>
        )}

        {/* 결재자: PENDING 상태이고 현재 사용자가 다음 결재자일 때만 승인/반려 버튼 */}
        {data?.status === ApprovalStatus.PENDING && tabValue === 1 && canApprove && (
          <>
            {onApprove && (
              <Button color="primary" variant="contained" onClick={onApprove}>
                승인
              </Button>
            )}
            {onReject && (
              <Button color="error" variant="outlined" onClick={onReject}>
                반려
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
