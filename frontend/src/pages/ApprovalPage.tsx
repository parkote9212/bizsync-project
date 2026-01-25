import {
  Box,
  Button,
  Container,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import { useEffect, useState } from "react";
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
    showToastOnSuccess: true,
    successMessage: "결재가 취소되었습니다.",
    loadingKey: "cancelApproval",
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchMyDrafts();
    } else if (tabValue === 1) {
      fetchMyPending();
    } else {
      fetchMyCompleted();
    }
  }, [tabValue]);

  const fetchMyDrafts = async () => {
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
  };

  const fetchMyPending = async () => {
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
  };

  const fetchMyCompleted = async () => {
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
  };


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

  const currentItems = tabValue === 0 ? myDrafts : tabValue === 1 ? myPending : myCompleted;

  return (
    <Container maxWidth="lg">
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
          onApprove={tabValue === 1 ? handleApprove : undefined}
          onReject={tabValue === 1 ? handleOpenRejectDialog : undefined}
        />
      </Paper>

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
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedDocumentId(null);
          setDetailData(null);
        }}
        onApprove={
          detailData?.status === ApprovalStatus.PENDING && tabValue === 1 && selectedDocumentId
            ? () => handleApprove(selectedDocumentId)
            : undefined
        }
        onReject={
          detailData?.status === ApprovalStatus.PENDING && tabValue === 1 && selectedDocumentId
            ? () => handleOpenRejectDialog(selectedDocumentId)
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
