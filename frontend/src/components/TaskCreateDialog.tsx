import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Autocomplete,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import client from "../api/client";
import type { TaskCreateData } from "../types/kanban";

interface TaskCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreateData) => void;
}

interface UserSearchResult {
  userId: number;
  name: string;
  email: string;
  department: string;
  position: string;
}

const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    deadline: new Date().toISOString().split("T")[0],
  });

  const [selectedWorker, setSelectedWorker] = useState<UserSearchResult | null>(null);
  const [searchOptions, setSearchOptions] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = () => {
    if (!form.title) return alert("제목을 입력해주세요.");

    const payload = {
      ...form,
      workerId: selectedWorker ? selectedWorker.userId : null,
    };

    onSubmit(payload);
    // 초기화
    setForm({
      title: "",
      content: "",
      deadline: new Date().toISOString().split("T")[0],
    });
    setSelectedWorker(null);
    setSearchOptions([]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>새 업무 만들기</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="업무 제목"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="설명"
            name="content"
            value={form.content}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="마감일"
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Autocomplete
            options={searchOptions}
            value={selectedWorker}
            onChange={(_event, newValue) => setSelectedWorker(newValue)}
            onInputChange={(_event, newInputValue) => {
              handleSearchUsers(newInputValue);
            }}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            loading={searchLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="담당자 검색 (이름 또는 이메일)"
                placeholder="비워두면 본인이 담당자가 됩니다"
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
                  <Typography variant="body2" fontWeight="medium">
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email}
                  </Typography>
                  {(option.position || option.department) && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {option.position && option.department
                        ? `${option.position} · ${option.department}`
                        : option.position || option.department}
                    </Typography>
                  )}
                </Box>
              </li>
            )}
            noOptionsText="검색 결과가 없습니다"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSubmit}>
          생성
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskCreateDialog;
