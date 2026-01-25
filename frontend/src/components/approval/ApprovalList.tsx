import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { ApprovalSummary } from "../../types/approval";
import { ApprovalStatus } from "../../types/approval";
import { formatDate, getStatusColor, getStatusLabel } from "../../utils/approval";

interface ApprovalListProps {
  items: ApprovalSummary[];
  loading: boolean;
  tabValue: number;
  onViewDetail: (documentId: number) => void;
  onApprove?: (documentId: number) => void;
  onReject?: (documentId: number) => void;
}

/**
 * 결재 목록을 표시하는 컴포넌트
 *
 * <p>결재 문서 목록을 테이블 형태로 표시하며, 상태별 색상과 작업 버튼을 제공합니다.
 *
 * @component
 * @param {ApprovalListProps} props - ApprovalList 컴포넌트 props
 * @param {ApprovalSummary[]} props.items - 표시할 결재 목록
 * @param {boolean} props.loading - 로딩 상태
 * @param {number} props.tabValue - 현재 탭 인덱스 (0: 기안함, 1: 대기함, 2: 완료함)
 * @param {Function} props.onViewDetail - 상세보기 버튼 클릭 시 호출되는 함수
 */
export const ApprovalList: React.FC<ApprovalListProps> = ({
  items,
  loading,
  tabValue,
  onViewDetail,
  onApprove,
  onReject,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>제목</TableCell>
            <TableCell>기안자</TableCell>
            <TableCell>상태</TableCell>
            <TableCell>기안일</TableCell>
            <TableCell>작업</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.documentId} hover>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.drafterName}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(item.docStatus)}
                  color={getStatusColor(item.docStatus)}
                  size="small"
                />
              </TableCell>
              <TableCell>{formatDate(item.createdAt)}</TableCell>
              <TableCell>
                <Box display="flex" gap={1} sx={{ flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onViewDetail(item.documentId)}
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                  >
                    상세보기
                  </Button>
                  {/* 결재 대기함(tabValue === 1)이고 PENDING 상태일 때 승인/반려 버튼 표시 */}
                  {tabValue === 1 && 
                   item.docStatus === ApprovalStatus.PENDING && 
                   (onApprove || onReject) && (
                    <>
                      {onApprove && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => onApprove(item.documentId)}
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                        >
                          승인
                        </Button>
                      )}
                      {onReject && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => onReject(item.documentId)}
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                        >
                          반려
                        </Button>
                      )}
                    </>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
