import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import type { TaskCreateData } from "../types/kanban";
import { useToast } from "../hooks/useToast";
import { useUserSearch } from "../hooks/useUserSearch";
import { SearchAutocomplete } from "./SearchAutocomplete";
import Toast from "./Toast";
import type { UserSearchResult } from "../types/user";

interface TaskCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreateData) => void;
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
  const [titleError, setTitleError] = useState("");
  const { showToast, toastState, closeToast } = useToast();
  const { searchOptions, searchLoading, handleSearchUsers, clearSearch } = useUserSearch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.title || form.title.trim() === "") {
      setTitleError("제목을 입력해주세요.");
      return;
    }

    setTitleError("");
    const payload = {
      ...form,
      workerId: selectedWorker ? selectedWorker.userId : null,
    };

    onSubmit(payload);
    showToast("업무가 생성되었습니다.", "success");
    // 초기화
    setForm({
      title: "",
      content: "",
      deadline: new Date().toISOString().split("T")[0],
    });
    setSelectedWorker(null);
    clearSearch();
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
            onChange={(e) => {
              handleChange(e);
              if (titleError) setTitleError("");
            }}
            fullWidth
            required
            autoFocus
            error={!!titleError}
            helperText={titleError}
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
          <SearchAutocomplete
            value={selectedWorker}
            options={searchOptions}
            loading={searchLoading}
            label="담당자 검색 (이름 또는 이메일)"
            placeholder="비워두면 본인이 담당자가 됩니다"
            onChange={setSelectedWorker}
            onInputChange={handleSearchUsers}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSubmit}>
          생성
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

export default TaskCreateDialog;
