import {
  Box,
  Button,
  Container,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { approvalApi } from "../api/approval";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { ApprovalCreateForm } from "../components/approval/ApprovalCreateForm";
import { ApprovalDetailView } from "../components/approval/ApprovalDetailView";
import { ApprovalList } from "../components/approval/ApprovalList";
import { ApprovalProcessDialog } from "../components/approval/ApprovalProcessDialog";
import { useMutation } from "../hooks/useApi";
import { useConfirmDialog } from "../hooks/useConfirmDialog";
import { useToast } from "../hooks/useToast";
import { useUserStore } from "../stores/userStore";
import type {
  ApprovalDetail,
  ApprovalProcessRequest,
  ApprovalSummary,
  ApprovalType,
} from "../types/approval";
import { ApprovalStatus } from "../types/approval";

/**
 * 결재 페이지 컴포넌트
 *
 * <p>결재 문서를 조회, 생성, 승인/반려 처리하는 메인 페이지입니다.
 * 기안함, 결재 대기함, 결재 완료함을 탭으로 구분하여 표시합니다.
 *
 * @component
 */
const ApprovalPage = () => {
  // 상태 관리 섹션
  const [tabValue, setTabValue] = useState(0);
  const [myDrafts, setMyDrafts] = useState<ApprovalSummary[]>([]);
  const [myPending, setMyPending] = useState<ApprovalSummary[]>([]);
  const [myCompleted, setMyCompleted] = useState<ApprovalSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<ApprovalDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processDocumentId, setProcessDocumentId] = useState<number | null>(null);

  // 훅 초기화 섹션
  const user = useUserStore((state) => state.user);
  const { showToast, toastState, closeToast } = useToast();
  const { showConfirm, confirmDialogState, closeConfirm } = useConfirmDialog();
  const { execute: createApproval } = useMutation({
    showToastOnSuccess: true,
    successMessage: "결재 상신이 완료되었습니다.",
    loadingKey: "createApproval",
  });
  const { execute: processApproval } = useMutation({
    showToastOnSuccess: true,
    loadingKey: "processApproval",
  });
  const { execute: cancelApproval } = useMutation({
    showToastOnSuccess: false, // 수동으로 토스트 표시
    loadingKey: "cancelApproval",
  });

  const fetchMyDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await approvalApi.getMyDrafts(0, 20);
      setMyDrafts(data.content || []);
    } catch (error) {
      console.error("기안함 조회 실패", error);
      showToast("기안함 조회에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchMyPending = useCallback(async () => {
    try {
      setLoading(true);
      const data = await approvalApi.getMyPending(0, 20);
      setMyPending(data.content || []);
    } catch (error) {
      console.error("결재 대기함 조회 실패", error);
      showToast("결재 대기함 조회에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchMyCompleted = useCallback(async () => {
    try {
      setLoading(true);
      const data = await approvalApi.getMyCompleted(0, 20);
      setMyCompleted(data.content || []);
    } catch (error) {
      console.error("결재 완료함 조회 실패", error);
      showToast("결재 완료함 조회에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 데이터 로드 섹션
  useEffect(() => {
    if (tabValue === 0) {
      fetchMyDrafts();
    } else if (tabValue === 1) {
      fetchMyPending();
    } else {
      fetchMyCompleted();
    }
  }, [tabValue, fetchMyDrafts, fetchMyPending, fetchMyCompleted]);

  // 이벤트 핸들러 섹션
  const handleCreateApproval = async (data: {
    title: string;
    content: string;
    type: ApprovalType;
    amount?: number;
    projectId?: number;
    approverIds: number[];
  }) => {
    const result = await createApproval(async () => {
      await approvalApi.createApproval(data);
    });

    if (result !== null) {
      setCreateDialogOpen(false);
      if (tabValue === 0) {
        fetchMyDrafts();
      }
    }
  };

  const handleViewDetail = async (documentId: number) => {
    setSelectedDocumentId(documentId);
    setDetailData(null);
    setDetailDialogOpen(true);
    setDetailLoading(true);
    try {
      const data = await approvalApi.getApprovalDetail(documentId);
      setDetailData(data);
    } catch (error: unknown) {
      const msg = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      showToast(msg || "결재 상세 조회에 실패했습니다.", "error");
      setDetailDialogOpen(false);
      setSelectedDocumentId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenRejectDialog = (documentId: number) => {
    setProcessDocumentId(documentId);
    setProcessDialogOpen(true);
  };

  const handleApprove = async (documentId: number): Promise<void> => {
    showConfirm(
      "결재 승인",
      "결재를 승인하시겠습니까?",
      async () => {
        const result = await processApproval(async () => {
          const payload: ApprovalProcessRequest = {
            status: ApprovalStatus.APPROVED,
          };
          await approvalApi.processApproval(documentId, payload);
        }, {
          successMessage: "결재가 정상적으로 승인되었습니다.",
        });

        if (result !== null) {
          // 확인 다이얼로그 닫기
          closeConfirm();
          
          // 상세보기가 열려있으면 닫기
          if (detailDialogOpen && selectedDocumentId === documentId) {
            setDetailDialogOpen(false);
            setSelectedDocumentId(null);
            setDetailData(null);
          }

          // 데이터 새로고침
          fetchMyPending();
          fetchMyCompleted();
          if (tabValue === 0) {
            fetchMyDrafts();
          }
        }
      },
      { severity: "warning" }
    );
  };

  const handleCancelApproval = async (documentId: number): Promise<void> => {
    showConfirm(
      "결재 취소",
      "결재를 취소하시겠습니까?",
      async () => {
        const result = await cancelApproval(async () => {
          await approvalApi.cancelApproval(documentId);
        });

        if (result !== null) {
          // 확인 다이얼로그 닫기
          closeConfirm();
          
          // 토스트 표시 (ApprovalPage의 Toast 컴포넌트 사용)
          showToast("결재가 취소되었습니다.", "success");
          
          // 상세보기가 열려있으면 닫기
          if (detailDialogOpen && selectedDocumentId === documentId) {
            setDetailDialogOpen(false);
            setSelectedDocumentId(null);
            setDetailData(null);
          }

          // 데이터 새로고침
          fetchMyDrafts();
        }
      },
      { severity: "warning" }
    );
  };

  const handleProcessRejection = async (reason: string): Promise<void> => {
    if (!processDocumentId) return;

    const result = await processApproval(async () => {
      const payload: ApprovalProcessRequest = {
        status: ApprovalStatus.REJECTED,
        comment: reason,
      };
      await approvalApi.processApproval(processDocumentId, payload);
    }, {
      successMessage: "결재가 정상적으로 반려되었습니다.",
    });

    if (result !== null) {
      setProcessDialogOpen(false);
      setProcessDocumentId(null);

      // 상세보기가 열려있으면 닫기
      if (detailDialogOpen && selectedDocumentId === processDocumentId) {
        setDetailDialogOpen(false);
        setSelectedDocumentId(null);
        setDetailData(null);
      }

      // 데이터 새로고침
      fetchMyPending();
      fetchMyCompleted();
      if (tabValue === 0) {
        fetchMyDrafts();
      }
    }
  };

  /**
   * 현재 사용자가 다음 결재자인지 확인
   * 
   * @param {ApprovalDetail | null} detail - 결재 상세 정보
   * @param {number | null | undefined} currentUserId - 현재 사용자 ID
   * @returns {boolean} 현재 사용자가 다음 결재자인지 여부
   */
  const isCurrentUserNextApprover = (detail: ApprovalDetail | null, currentUserId: number | null | undefined): boolean => {
    if (!detail || !currentUserId) {
      return false;
    }

    // 타입 안전한 비교: 명시적으로 Number로 변환
    const normalizedUserId = Number(currentUserId);

    // 현재 사용자의 결재선 찾기 (타입 안전한 비교)
    const userLine = detail.approvalLines.find((line) => {
      const normalizedApproverId = Number(line.approverId);
      return normalizedApproverId === normalizedUserId;
    });

    if (!userLine) {
      return false;
    }

    // 현재 사용자의 결재선이 PENDING 상태가 아니면 false
    if (userLine.status !== ApprovalStatus.PENDING) {
      return false;
    }

    // 현재 사용자의 sequence보다 작은 모든 결재선이 APPROVED 상태인지 확인
    const previousLines = detail.approvalLines.filter(
      (line) => line.sequence < userLine.sequence
    );

    // 이전 결재선이 모두 APPROVED 상태여야 함 (이전 결재선이 없으면 첫 번째 결재자이므로 true)
    return previousLines.length === 0 || previousLines.every((line) => line.status === ApprovalStatus.APPROVED);
  };


  // 렌더링 섹션
  const currentItems = tabValue === 0 ? myDrafts : tabValue === 1 ? myPending : myCompleted;

  return (
    <Container maxWidth="lg">
      {/* 헤더 섹션: 결재 기안 버튼 */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        mb={3}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => setCreateDialogOpen(true)}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          새 결재 기안
        </Button>
      </Box>

      {/* 결재 목록 섹션: 탭 및 리스트 */}
      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="내 기안함" />
          <Tab label="내 결재 대기함" />
          <Tab label="내 결재 완료함" />
        </Tabs>

        <ApprovalList
          items={currentItems}
          loading={loading}
          tabValue={tabValue}
          onViewDetail={handleViewDetail}
          onApprove={
            tabValue === 1
              ? async (documentId: number) => {
                  // 상세 정보를 먼저 가져와서 권한 체크
                  try {
                    const detailData = await approvalApi.getApprovalDetail(documentId);
                    const isMyTurn = isCurrentUserNextApprover(detailData, user.userId);
                    if (!isMyTurn) {
                      showToast("이전 결재자의 승인이 필요합니다.", "warning");
                      return;
                    }
                    // 권한이 있으면 승인 처리 (handleApprove는 내부에서 확인 다이얼로그를 띄움)
                    handleApprove(documentId);
                  } catch (error) {
                    console.error("결재 상세 조회 실패", error);
                    showToast("결재 정보를 불러오는데 실패했습니다.", "error");
                  }
                }
              : undefined
          }
          onReject={
            tabValue === 1
              ? async (documentId: number) => {
                  // 상세 정보를 먼저 가져와서 권한 체크
                  try {
                    const detailData = await approvalApi.getApprovalDetail(documentId);
                    const isMyTurn = isCurrentUserNextApprover(detailData, user.userId);
                    if (!isMyTurn) {
                      showToast("이전 결재자의 승인이 필요합니다.", "warning");
                      return;
                    }
                    // 권한이 있으면 반려 다이얼로그 열기
                    handleOpenRejectDialog(documentId);
                  } catch (error) {
                    console.error("결재 상세 조회 실패", error);
                    showToast("결재 정보를 불러오는데 실패했습니다.", "error");
                  }
                }
              : undefined
          }
        />
      </Paper>

      {/* 다이얼로그 섹션 */}
      <ApprovalCreateForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateApproval}
      />

      <ApprovalDetailView
        open={detailDialogOpen}
        loading={detailLoading}
        data={detailData}
        tabValue={tabValue}
        currentUserId={user.userId}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedDocumentId(null);
          setDetailData(null);
        }}
        onApprove={
          tabValue === 1 && selectedDocumentId
            ? () => {
                // 데이터가 없거나 PENDING 상태가 아니면 처리하지 않음
                if (!detailData || detailData.status !== ApprovalStatus.PENDING) {
                  return;
                }
                // 권한 체크: 현재 사용자가 다음 결재자인지 확인
                const isMyTurn = isCurrentUserNextApprover(detailData, user.userId);
                if (!isMyTurn) {
                  showToast("이전 결재자의 승인이 필요합니다.", "warning");
                  return;
                }
                handleApprove(selectedDocumentId);
              }
            : undefined
        }
        onReject={
          tabValue === 1 && selectedDocumentId
            ? () => {
                // 데이터가 없거나 PENDING 상태가 아니면 처리하지 않음
                if (!detailData || detailData.status !== ApprovalStatus.PENDING) {
                  return;
                }
                // 권한 체크: 현재 사용자가 다음 결재자인지 확인
                const isMyTurn = isCurrentUserNextApprover(detailData, user.userId);
                if (!isMyTurn) {
                  showToast("이전 결재자의 승인이 필요합니다.", "warning");
                  return;
                }
                handleOpenRejectDialog(selectedDocumentId);
              }
            : undefined
        }
        onCancel={
          detailData?.status === ApprovalStatus.PENDING && tabValue === 0 && selectedDocumentId
            ? () => handleCancelApproval(selectedDocumentId)
            : undefined
        }
      />

      <ApprovalProcessDialog
        open={processDialogOpen}
        onClose={() => {
          setProcessDialogOpen(false);
          setProcessDocumentId(null);
        }}
        onSubmit={handleProcessRejection}
      />

      <Toast
        open={toastState.open}
        message={toastState.message}
        severity={toastState.severity}
        onClose={closeToast}
      />

      <ConfirmDialog
        open={confirmDialogState.open}
        title={confirmDialogState.title}
        message={confirmDialogState.message}
        severity={confirmDialogState.severity}
        onConfirm={confirmDialogState.onConfirm}
        onCancel={closeConfirm}
      />
    </Container>
  );
};

export default ApprovalPage;
