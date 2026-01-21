import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import client from "../api/client";
import type { User } from "../types/common";

const OrganizationPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await client.get("/users");

        if (response.data?.status === "SUCCESS" && response.data?.data) {
          setUsers(response.data.data);
        } else {
          console.warn("예상치 못한 응답 형식:", response.data);
          setUsers([]);
        }
      } catch (error) {
        console.error("사용자 목록 조회 실패", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.department && user.department.toLowerCase().includes(search)) ||
      (user.empNo && user.empNo.toLowerCase().includes(search))
    );
  });

  return (
    <Container maxWidth="lg">


      <Paper elevation={2} sx={{ p: 3 }}>
        <TextField
          fullWidth
          placeholder="이름, 이메일, 부서, 사번으로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box textAlign="center" py={5}>
            <PersonIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              사용자 정보가 없습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              백엔드 API 연결 후 사용자 목록이 표시됩니다.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredUsers.map((user) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.userId}>
                <Card elevation={1}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="h6" fontWeight="bold">
                        {user.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                    {user.department && (
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        부서: {user.department}
                      </Typography>
                    )}
                    {user.position && (
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        직급: {user.position}
                      </Typography>
                    )}
                    {user.empNo && (
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        사번: {user.empNo}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      권한: {user.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default OrganizationPage;
