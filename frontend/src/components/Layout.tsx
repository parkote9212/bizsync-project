import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FolderIcon from "@mui/icons-material/Folder";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleIcon from "@mui/icons-material/People";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import type { Notification } from "../stores/notificationStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useProjectStore } from "../stores/projectStore";
import { useThemeStore } from "../stores/themeStore";
import { useUserStore } from "../stores/userStore";
import type { NavigationMenuItem } from "../types/common";
import PasswordChangeDialog from "./PasswordChangeDialog";

const DRAWER_WIDTH = 240;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Zustand 스토어에서 사용자 정보 가져오기 (persist 미들웨어로 localStorage와 자동 동기화)
  const user = useUserStore((state) => state.user);
  const userId = user.userId;

  // Zustand notificationStore 사용
  const addNotification = useNotificationStore((state) => state.addNotification);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  // 알림 수신 핸들러 - notificationStore 저장 + 실시간 Snackbar 표시
  const handleNotification = useCallback((notification: Notification) => {
    addNotification(notification);
    setSnackbarMessage(notification.message);
    setSnackbarOpen(true);
  }, [addNotification]);

  // WebSocket 연결
  useNotificationSocket(userId, handleNotification);

  const menuItems: NavigationMenuItem[] = [
    { text: "내 대시보드", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "프로젝트 관리", icon: <FolderIcon />, path: "/projects" },
    { text: "전자결재", icon: <DescriptionIcon />, path: "/approvals" },
    { text: "조직도", icon: <PeopleIcon />, path: "/organization" },
  ];

  // 현재 페이지 제목 가져오기
  const getPageTitle = () => {
    const currentPath = location.pathname;

    // 프로젝트 상세 페이지 (칸반 보드)
    if (currentPath.startsWith("/projects/") && currentPath.match(/\/projects\/\d+$/)) {
      return "칸반 보드";
    }

    // 일반 페이지 매칭
    const menuItem = menuItems.find(item => item.path === currentPath);
    if (menuItem) return menuItem.text;

    // 기본값
    return "BizSync";
  };

  const clearUser = useUserStore((state) => state.clearUser);
  const clearNotifications = useNotificationStore((state) => state.clearAll);
  const resetProjects = useProjectStore((state) => state.reset);

  // 다크모드 스토어
  const themeMode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleMode);
  const isDarkMode = themeMode === "dark";

  const handleLogout = () => {
    // 1. 사용자별 데이터 스토어 초기화 (이전 사용자 데이터 노출 방지)
    clearNotifications();
    resetProjects();
    // 2. 토큰·사용자 정보 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    clearUser();
    navigate("/login");
    setProfileAnchor(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setNotificationAnchor(null);
    setProfileAnchor(null);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar (상단 헤더) */}
      <AppBar
        position="fixed"
        color="default"
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          boxShadow: 1,
        }}
      >
        <Toolbar>
          {/* 현재 페이지 제목 */}
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              color: "text.primary",
            }}
          >
            {getPageTitle()}
          </Typography>

          {/* 알림 아이콘 */}
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            sx={{ mr: 1 }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              invisible={unreadCount === 0}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* 다크모드 토글 버튼 */}
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{ mr: 2 }}
            title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* 알림 메뉴 */}
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: {
                sx: { maxHeight: 400, width: 350 },
              },
            }}
          >
            <Box sx={{ p: 1 }}>
              {/* 알림 헤더 */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  알림
                </Typography>
                {notifications.length > 0 && unreadCount > 0 && (
                  <Button
                    size="small"
                    startIcon={<DoneAllIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    모두 읽음
                  </Button>
                )}
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <MenuItem onClick={handleMenuClose}>
                  <Typography variant="body2" color="text.secondary">
                    알림이 없습니다.
                  </Typography>
                </MenuItem>
              ) : (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id || notification.timestamp}
                    onClick={() => {
                      // 알림 읽음 처리
                      if (notification.id) {
                        markAsRead(notification.id);
                      }
                      handleMenuClose();
                      // 알림 타입에 따라 이동
                      if (notification.type === "APPROVAL") {
                        navigate(`/approvals`);
                      } else if (notification.type === "BOARD" && notification.targetId) {
                        navigate(`/projects/${notification.targetId}`);
                      }
                    }}
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      whiteSpace: "normal",
                      bgcolor: notification.read ? "transparent" : "action.hover",
                      pr: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <Box sx={{ flexGrow: 1, pr: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight={notification.read ? "normal" : "bold"}
                        >
                          {notification.type === "APPROVAL" && "🔔 "}
                          {notification.type === "BOARD" && "📋 "}
                          {notification.message}
                        </Typography>
                        {notification.createdAt && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.createdAt).toLocaleString("ko-KR")}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (notification.id) {
                            removeNotification(notification.id);
                          }
                        }}
                        sx={{ ml: 1, alignSelf: "flex-start" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Box>
          </Menu>

          {/* 프로필 영역 */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{
                cursor: "pointer",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
              }}
              onClick={handleProfileClick}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                <AccountCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {user.name || (user.userId ? `ID: ${user.userId}` : "사용자")}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                minWidth: "auto",
                px: 1.5,
                py: 0.5,
                fontSize: "0.75rem",
              }}
            >
              로그아웃
            </Button>
          </Box>

          {/* 프로필 메뉴 */}
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                사용자 정보
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {user.name ? `이름: ${user.name}` : `ID: ${user.userId || "-"}`}
              </Typography>
              {user.email && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  이메일: {user.email}
                </Typography>
              )}
              {user.department && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  부서: {user.department}
                </Typography>
              )}
              {user.position && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  직급: {user.position}
                </Typography>
              )}
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setProfileAnchor(null);
                setPasswordDialogOpen(true);
              }}
              sx={{
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <LockIcon sx={{ mr: 1, fontSize: "1rem" }} />
              비밀번호 변경
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "error.main",
                "&:hover": { bgcolor: "error.light", color: "error.dark" },
              }}
            >
              로그아웃
            </MenuItem>
          </Menu>

          {/* 비밀번호 변경 Dialog */}
          <PasswordChangeDialog
            open={passwordDialogOpen}
            onClose={() => setPasswordDialogOpen(false)}
          />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {/* 로고 영역 */}
        <Box
          sx={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              letterSpacing: 1,
            }}
          >
            BizSync
          </Typography>
        </Box>

        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path || location.pathname.startsWith(item.path + "/")}
                  onClick={() => navigate(item.path)}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "primary.light",
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                        ? "primary.main"
                        : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* 메인 컨텐츠 영역 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* 실시간 알림 Snackbar (기안→결재자, 최종승인/반려→기안자) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 7 }}
      />
    </Box>
  );
};

export default Layout;
