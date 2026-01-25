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

interface ProjectInviteDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string | undefined;
}

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

    const result = await inviteMember(async () => {
      await projectApi.inviteMember(projectId, selectedUser.email);
    });

    if (result !== null) {
      setSelectedUser(null);
      clearSearch();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
        <Button onClick={onClose} color="inherit">
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
