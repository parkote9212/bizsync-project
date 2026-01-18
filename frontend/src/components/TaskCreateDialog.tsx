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
    deadline: new Date().toISOString().split("T")[0], // 오늘 날짜 기본값
    workerId: "", // 비워두면 백엔드에서 '본인'으로 처리
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.title) return alert("제목을 입력해주세요.");

    // workerId가 빈 문자열이면 null로 보내서 백엔드가 처리하게 함
    const payload = {
      ...form,
      workerId: form.workerId ? Number(form.workerId) : null,
    };

    onSubmit(payload);
    // 초기화
    setForm({
      title: "",
      content: "",
      deadline: new Date().toISOString().split("T")[0],
      workerId: "",
    });
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
          {/* 담당자 선택 기능 (추후 멤버 목록 API 연동 필요) 
              지금은 기본값(본인)으로 동작하므로 UI는 숨기거나 텍스트로 안내 가능
          */}
          <TextField
            label="담당자 (ID 입력, 비워두면 본인)"
            name="workerId"
            type="number"
            value={form.workerId}
            onChange={handleChange}
            fullWidth
            helperText="팀원 목록 연동 전까지는 ID 숫자를 직접 입력하거나 비워두세요."
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
