import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CardActions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import client from "../api/client";
import { useNavigate } from "react-router-dom";
import ProjectCreateDialog from "../components/ProjectCreateDialog";

// DTO 타입 정의
interface Project {
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openModal, setOpenModal] = useState(false);

  // 프로젝트 목록 조회 (데이터만 반환)
  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    const response = await client.get("/projects");
    return response.data as Project[];
  }, []);

  // 페이지 로드 시 API 호출 (언마운트 시 setState 방지)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchProjects();
        if (!cancelled) {
          setProjects(data);
        }
      } catch (error: unknown) {
        console.error("프로젝트 목록 로드 실패", error);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchProjects]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 섹션 */}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        mb={4}
      >
        <Typography variant="h4" component={"h1"} fontWeight={"bold"}>
          내 프로젝트
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setOpenModal(true)}
        >
          새 프로젝트
        </Button>
      </Box>

      {/* 프로젝트 리스트 (Grid) */}
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.projectId}>
            <Card
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display={"flex"} alignItems={"center"} mb={2}>
                  <FolderIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component={"h2"} fontWeight={"bold"}>
                    {project.name}
                  </Typography>
                </Box>
                <Typography color="text.secondary" gutterBottom>
                  {project.description || "설명이 없습니다."}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  기간 : {project.startDate} ~ {project.endDate}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/projects/${project.projectId}`)}
                >
                  보드 입장
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {/* 프로젝트가 없을 때 안내 문구 */}
        {projects.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box textAlign="center" py={5} px={2} color="text.secondary">
              <Typography variant="h6" sx={{ whiteSpace: "normal" }}>
                참여 중인 프로젝트가 없습니다.
              </Typography>
              <Typography sx={{ whiteSpace: "normal", mt: 0.5 }}>
                새로운 프로젝트를 생성해보세요!
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* ★ 모달 컴포넌트 */}
      <ProjectCreateDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={async () => {
          const data = await fetchProjects();
          setProjects(data);
          setOpenModal(false);
        }}
      />
    </Container>
  );
};

export default ProjectListPage;
