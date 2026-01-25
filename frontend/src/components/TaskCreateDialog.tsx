import React, { useState, useEffect } from "react";
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
import { SearchAutocomplete } from "./SearchAutocomplete";
import Toast from "./Toast";
import type { UserSearchResult } from "../types/user";
import client from "../api/client";

/**
 * 업무 생성 다이얼로그 Props
 */
interface TaskCreateDialogProps {
  /** 다이얼로그 열림/닫힘 상태 */
  open: boolean;
  /** 다이얼로그 닫기 콜백 */
  onClose: () => void;
  /** 업무 생성 제출 콜백 */
  onSubmit: (data: TaskCreateData) => void;
  /** 프로젝트 ID (프로젝트 멤버만 검색하기 위해 필요) */
  projectId?: number | null;
}

/**
 * 업무 생성 다이얼로그 컴포넌트
 *
 * <p>새로운 업무를 생성하는 다이얼로그입니다.
 * 제목, 설명, 마감일, 담당자를 입력할 수 있습니다.
 *
 * @component
 * @param {TaskCreateDialogProps} props - 컴포넌트 props
 * @returns {JSX.Element} 업무 생성 다이얼로그
 */
const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({
  open,
  onClose,
  onSubmit,
  projectId,
}) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    deadline: new Date().toISOString().split("T")[0],
  });

  const [selectedWorker, setSelectedWorker] = useState<UserSearchResult | null>(null);
  const [titleError, setTitleError] = useState("");
  const { showToast, toastState, closeToast } = useToast();
  const [projectMembers, setProjectMembers] = useState<UserSearchResult[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<UserSearchResult[]>([]);

  // 프로젝트 멤버 목록 로드
  useEffect(() => {
    if (!open || !projectId) {
      return;
    }

    const fetchProjectMembers = async () => {
      try {
        const response = await client.get(`/projects/${projectId}/members`);
        const members = response.data || [];
        // ProjectMemberResponseDTO를 UserSearchResult 형식으로 변환
        const memberList: UserSearchResult[] = members.map((member: any) => ({
          userId: member.userId,
          name: member.name,
          email: member.email,
          department: member.department || "",
          position: member.position || "",
        }));
        setProjectMembers(memberList);
      } catch (error) {
        console.error("프로젝트 멤버 목록 조회 실패:", error);
        setProjectMembers([]);
      }
    };
    fetchProjectMembers();
  }, [open, projectId]);

  // 다이얼로그가 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setProjectMembers([]);
      setSearchKeyword("");
      setSearchOptions([]);
    }
  }, [open]);

  // 검색어에 따라 프로젝트 멤버 필터링
  useEffect(() => {
    if (!searchKeyword || searchKeyword.length < 2) {
      return;
    }

    setSearchLoading(true);
    const keyword = searchKeyword.toLowerCase();
    const filtered = projectMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(keyword) ||
        member.email.toLowerCase().includes(keyword)
    );
    setSearchOptions(filtered);
    setSearchLoading(false);
  }, [searchKeyword, projectMembers]);

  const handleSearchUsers = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchOptions([]);
  };

  /**
   * 폼 입력값 변경 핸들러
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - 입력 이벤트
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setSearchKeyword("");
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
            onChange={(e) => handleChange(e)}
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
            label="담당자 검색 (프로젝트 멤버만 검색 가능)"
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
