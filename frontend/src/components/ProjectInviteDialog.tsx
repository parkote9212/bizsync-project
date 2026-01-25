import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { projectApi } from "../api/project";
import { useToast } from "../hooks/useToast";
import { useUserSearch } from "../hooks/useUserSearch";
import { useMutation } from "../hooks/useApi";
import { SearchAutocomplete } from "./SearchAutocomplete";
import Toast from "./Toast";
import type { UserSearchResult } from "../types/user";

/**
 * 프로젝트 팀원 초대 다이얼로그 Props
 */
interface ProjectInviteDialogProps {
  /** 다이얼로그 열림/닫힘 상태 */
  open: boolean;
  /** 다이얼로그 닫기 콜백 */
  onClose: () => void;
  /** 프로젝트 ID */
  projectId: string | undefined;
}

/**
 * 프로젝트 팀원 초대 다이얼로그 컴포넌트
 *
 * <p>프로젝트에 새로운 팀원을 초대하는 다이얼로그입니다.
 * 사용자 검색을 통해 초대할 팀원을 선택할 수 있습니다.
 *
 * @component
 * @param {ProjectInviteDialogProps} props - 컴포넌트 props
 * @returns {JSX.Element} 프로젝트 팀원 초대 다이얼로그
 */
const ProjectInviteDialog: React.FC<ProjectInviteDialogProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const { showToast, toastState, closeToast } = useToast();
  const { searchOptions, searchLoading, handleSearchUsers, clearSearch } = useUserSearch();
  const { execute: inviteMember, isLoading } = useMutation({
    showToastOnSuccess: true,
    successMessage: "팀원을 초대했습니다!",
    loadingKey: "invite",
  });

  const handleInvite = async () => {
    if (!selectedUser || !projectId) return;

    try {
      const result = await inviteMember(async () => {
        await projectApi.inviteMember(projectId, selectedUser.email);
      });

      // 성공 시 (result가 null이 아닌 경우, void는 undefined를 반환하므로 != null로 체크)
      // 또는 에러가 발생하지 않았다면 성공으로 간주
      if (result !== null) {
        setSelectedUser(null);
        clearSearch();
        onClose();
      }
    } catch (error) {
      // 에러는 useMutation에서 이미 처리하므로 여기서는 추가 처리 불필요
      console.error("팀원 초대 실패:", error);
    }
  };

  // 다이얼로그가 닫힐 때 상태 초기화
  const handleClose = () => {
    setSelectedUser(null);
    clearSearch();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>팀원 초대하기</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          초대할 팀원의 이름 또는 이메일을 검색해주세요.
        </Typography>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <SearchAutocomplete
            value={selectedUser}
            options={searchOptions}
            loading={searchLoading}
            label="이름 또는 이메일 검색"
            placeholder="최소 2글자 입력"
            onChange={setSelectedUser}
            onInputChange={handleSearchUsers}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button
          onClick={handleInvite}
          variant="contained"
          disabled={isLoading || !selectedUser}
        >
          {isLoading ? "초대 중..." : "초대 보내기"}
        </Button>
      </DialogActions>
      <Toast
        open={toastState.open}
        message={toastState.message}
        severity={toastState.severity}
        onClose={closeToast}
      />
    </Dialog>
  );
};

export default ProjectInviteDialog;
