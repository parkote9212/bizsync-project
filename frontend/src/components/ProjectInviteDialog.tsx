import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import client from "../api/client";

interface ProjectInviteDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string | undefined;
}

interface UserSearchResult {
  userId: number;
  name: string;
  email: string;
  department: string;
  position: string;
}

const ProjectInviteDialog: React.FC<ProjectInviteDialogProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [searchOptions, setSearchOptions] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearchUsers = async (keyword: string) => {
    if (!keyword || keyword.length < 2) {
      setSearchOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await client.get(`/users/search?keyword=${keyword}`);
      setSearchOptions(response.data.data || []);
    } catch (error) {
      console.error("사용자 검색 실패:", error);
      setSearchOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedUser || !projectId) return;

    setLoading(true);
    try {
      await client.post(`/projects/${projectId}/invite`, {
        email: selectedUser.email,
      });
      alert("팀원을 초대했습니다!");
      setSelectedUser(null);
      setSearchOptions([]);
      onClose();
    } catch (error: unknown) {
      console.error("초대 실패", error);
      const message =
        (error instanceof Object &&
          "response" in error &&
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message) ||
        "초대에 실패했습니다.";
      alert(message);
    } finally {
      setLoading(false);
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
          <Autocomplete
            options={searchOptions}
            value={selectedUser}
            onChange={(_event, newValue) => setSelectedUser(newValue)}
            onInputChange={(_event, newInputValue) => {
              handleSearchUsers(newInputValue);
            }}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            loading={searchLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="이름 또는 이메일 검색"
                placeholder="최소 2글자 입력"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {option.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.position && option.department
                      ? `${option.position} · ${option.department}`
                      : option.position || option.department || ""}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText="검색 결과가 없습니다"
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
          disabled={loading || !selectedUser}
        >
          {loading ? "초대 중..." : "초대 보내기"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectInviteDialog;
