import React, { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { ApprovalFormData, ApprovalCreateRequest } from "../../types/approval";
import { ApprovalType } from "../../types/approval";
import type { UserSearchResult } from "../../types/user";
import { SearchAutocomplete } from "../SearchAutocomplete";
import { useUserSearch } from "../../hooks/useUserSearch";
import { formatCurrency } from "../../utils/approval";

interface ApprovalCreateFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    type: ApprovalType;
    amount?: number;
    projectId?: number;
    approverIds: number[];
  }) => Promise<void>;
}

/**
 * 결재 작성 폼 컴포넌트
 *
 * <p>새로운 결재 문서를 작성하기 위한 폼 다이얼로그입니다.
 * 결재 유형, 제목, 내용, 결재선 등을 입력할 수 있습니다.
 *
 * @component
 * @param {ApprovalCreateFormProps} props - ApprovalCreateForm 컴포넌트 props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {Function} props.onClose - 다이얼로그를 닫을 때 호출되는 함수
 * @param {Function} props.onSubmit - 폼 제출 시 호출되는 함수
 */
export const ApprovalCreateForm: React.FC<ApprovalCreateFormProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ApprovalFormData>({
    title: "",
    content: "",
    type: ApprovalType.WORK,
    amount: "",
    projectId: "",
    approvers: [],
  });

  const [formErrors, setFormErrors] = useState<{
    approvers?: string;
    amount?: string;
    projectId?: string;
  }>({});

  const { searchOptions, searchLoading, handleSearchUsers, clearSearch } = useUserSearch();

  const handleSubmit = async () => {
    const approverIds = formData.approvers.map((user) => user.userId);
    const errors: { approvers?: string; amount?: string; projectId?: string } = {};

    if (approverIds.length === 0) {
      errors.approvers = "결재자를 1명 이상 선택해주세요.";
      setFormErrors(errors);
      return;
    }

    if (formData.type === ApprovalType.EXPENSE) {
      if (!formData.projectId) {
        errors.projectId = "비용 결재는 프로젝트가 필수입니다.";
      }
      if (!formData.amount) {
        errors.amount = "비용 결재는 금액이 필수입니다.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const payload: ApprovalCreateRequest = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      approverIds,
      ...(formData.projectId && { projectId: parseInt(formData.projectId) }),
      ...(formData.type === ApprovalType.EXPENSE && formData.amount && {
        amount: parseFloat(formData.amount.replace(/,/g, "")),
      }),
    };

    await onSubmit(payload);

    // 폼 초기화
    setFormData({
      title: "",
      content: "",
      type: ApprovalType.WORK,
      amount: "",
      projectId: "",
      approvers: [],
    });
    clearSearch();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      content: "",
      type: ApprovalType.WORK,
      amount: "",
      projectId: "",
      approvers: [],
    });
    setFormErrors({});
    clearSearch();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>새 결재 기안</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          각 결재자의 사용자 ID를 입력하세요. 결재선은 위에서부터 1차, 2차 순서로 진행됩니다.
        </Alert>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="제목"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>결재 유형</InputLabel>
              <Select
                value={formData.type}
                label="결재 유형"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ApprovalType })}
              >
                <MenuItem value="LEAVE">휴가</MenuItem>
                <MenuItem value="EXPENSE">비용</MenuItem>
                <MenuItem value="WORK">업무</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {formData.type === "EXPENSE" && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="프로젝트 ID"
                  required
                  value={formData.projectId}
                  onChange={(e) => {
                    setFormData({ ...formData, projectId: e.target.value });
                    if (formErrors.projectId) {
                      setFormErrors({ ...formErrors, projectId: undefined });
                    }
                  }}
                  error={!!formErrors.projectId}
                  helperText={formErrors.projectId || ""}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="금액"
                  required
                  value={formData.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFormData({ ...formData, amount: formatCurrency(value) });
                    if (formErrors.amount) {
                      setFormErrors({ ...formErrors, amount: undefined });
                    }
                  }}
                  error={!!formErrors.amount}
                  helperText={formErrors.amount || "숫자 입력 시 콤마 자동 포맷팅"}
                />
              </Grid>
            </>
          )}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="내용"
              required
              multiline
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              결재선 (순서대로 1차, 2차, …)
            </Typography>
            <SearchAutocomplete
              valueMultiple={formData.approvers}
              options={searchOptions}
              loading={searchLoading}
              label="결재자 검색 (이름 또는 이메일)"
              placeholder="최소 2글자 입력"
              multiple
              onChangeMultiple={(value) => {
                setFormData({ ...formData, approvers: value });
                if (formErrors.approvers) {
                  setFormErrors({ ...formErrors, approvers: undefined });
                }
              }}
              onInputChange={handleSearchUsers}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              * 선택한 순서대로 결재가 진행됩니다.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSubmit} variant="contained">
          상신하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};
