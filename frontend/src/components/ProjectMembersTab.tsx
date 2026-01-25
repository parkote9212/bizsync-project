import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import client from "../api/client";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import { createToastState, closeToast, type ToastState } from "../utils/toast";

interface Member {
  userId: number;
  name: string;
  email: string;
  department: string;
  position: string;
  role: "PL" | "MEMBER";
}

interface ProjectMembersTabProps {
  projectId: string | undefined;
}

const ProjectMembersTab: React.FC<ProjectMembersTabProps> = ({ projectId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/projects/${projectId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("멤버 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: number, newRole: "PL" | "MEMBER") => {
    setConfirmDialog({
      open: true,
      title: "권한 변경",
      message: "멤버의 권한을 변경하시겠습니까?",
      onConfirm: async () => {
        try {
          await client.patch(`/projects/${projectId}/members/${memberId}/role`, {
            role: newRole,
          });
          setToast(createToastState("권한이 변경되었습니다.", "success"));
          fetchMembers();
        } catch (error: any) {
          console.error("권한 변경 실패:", error);
          const errorMessage = error.response?.data?.message || "권한 변경에 실패했습니다.";
          setToast(createToastState(errorMessage, "error"));
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    setConfirmDialog({
      open: true,
      title: "멤버 제외",
      message: `${memberName}님을 프로젝트에서 제외하시겠습니까?`,
      onConfirm: async () => {
        try {
          await client.delete(`/projects/${projectId}/members/${memberId}`);
          setToast(createToastState("멤버가 제외되었습니다.", "success"));
          fetchMembers();
        } catch (error: any) {
          console.error("멤버 제외 실패:", error);
          const errorMessage = error.response?.data?.message || "멤버 제외에 실패했습니다.";
          setToast(createToastState(errorMessage, "error"));
        }
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        총 {members.length}명의 멤버가 있습니다.
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell>이메일</TableCell>
              <TableCell>부서</TableCell>
              <TableCell>직급</TableCell>
              <TableCell>권한</TableCell>
              <TableCell align="center">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  멤버가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.department || "-"}</TableCell>
                  <TableCell>{member.position || "-"}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.userId, e.target.value as "PL" | "MEMBER")
                        }
                      >
                        <MenuItem value="PL">리더 (PL)</MenuItem>
                        <MenuItem value="MEMBER">멤버</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveMember(member.userId, member.name)}
                    >
                      제외
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => closeToast(setToast)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </Box>
  );
};

export default ProjectMembersTab;
