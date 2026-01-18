import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import client from "../api/client";

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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim() || !projectId) return;

    setLoading(true);
    try {
      // API 호출: POST /api/projects/{projectId}/invite
      await client.post(`/projects/${projectId}/invite`, { email });
      alert("팀원을 초대했습니다!");
      setEmail("");
      onClose();
    } catch (error: unknown) {
      console.error("초대 실패", error);
      // 백엔드 에러 메시지(예: "이미 멤버입니다")를 보여주면 더 좋음
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>팀원 초대하기</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          초대할 팀원의 이메일 주소를 입력해주세요.
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="이메일 주소"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@bizsync.com"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          취소
        </Button>
        <Button onClick={handleInvite} variant="contained" disabled={loading}>
          {loading ? "초대 중..." : "초대 보내기"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectInviteDialog;
