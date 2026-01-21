import React, { useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import type { NavigationMenuItem } from "../types/common";
import { useNotificationSocket, type Notification } from "../hooks/useNotificationSocket";
import { getCurrentUserId, getCurrentUserInfo } from "../utils/auth";

const DRAWER_WIDTH = 240;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // 현재 사용자 ID
  const userId = getCurrentUserId();
  const userInfo = getCurrentUserInfo();
  
  // TODO: 백엔드 API 필요 - 사용자 이름 조회
  // JWT 토큰에 이름 정보가 없고, 사용자 정보 조회 API가 없어서 현재는 ID만 표시

  // 알림 수신 핸들러
  const handleNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setHasNewNotifications(true);
  }, []);

  // WebSocket 연결
  useNotificationSocket(userId, handleNotification);

  const menuItems: NavigationMenuItem[] = [
    { text: "내 대시보드", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "프로젝트 관리", icon: <FolderIcon />, path: "/projects" },
    { text: "전자결재", icon: <DescriptionIcon />, path: "/approvals" },
    { text: "조직도", icon: <PeopleIcon />, path: "/organization" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
    setProfileAnchor(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
    setHasNewNotifications(false); // 알림 확인 시 빨간 점 제거
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
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          backgroundColor: "#fff",
          color: "#000",
          boxShadow: 1,
        }}
      >
        <Toolbar>
          {/* 로고 */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 0,
              fontWeight: "bold",
              color: "primary.main",
              mr: 3,
            }}
          >
            BizSync
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* 알림 아이콘 */}
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            sx={{ mr: 2 }}
          >
            <Badge
              color="error"
              variant="dot"
              invisible={!hasNewNotifications}
            >
              <NotificationsIcon />
            </Badge>
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
              <Typography variant="h6" sx={{ px: 2, py: 1, fontWeight: "bold" }}>
                알림
              </Typography>
              <Divider />
              {notifications.length === 0 ? (
                <MenuItem onClick={handleMenuClose}>
                  <Typography variant="body2" color="text.secondary">
                    알림이 없습니다.
                  </Typography>
                </MenuItem>
              ) : (
                notifications.map((notification, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      handleMenuClose();
                      // 알림 타입에 따라 이동
                      if (notification.type === "APPROVAL") {
                        navigate(`/approvals`);
                      }
                    }}
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      whiteSpace: "normal",
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {notification.type === "APPROVAL" && "🔔 "}
                      {notification.message}
                    </Typography>
                    {notification.createdAt && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleString("ko-KR")}
                      </Typography>
                    )}
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
                  {userInfo.userId ? `ID: ${userInfo.userId}` : "사용자"}
                </Typography>
                <Typography variant="caption" color="error" sx={{ fontSize: "0.65rem", display: "block" }}>
                  백엔드 기능 필요: 사용자 이름 표시를 위한 API 필요
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
                ID: {userInfo.userId || "-"}
              </Typography>
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                백엔드 기능 필요: 사용자 이름 표시를 위한 API 필요
                <br />
                (GET /api/users/me 또는 GET /api/auth/me)
              </Typography>
              {userInfo.role && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  권한: {userInfo.role}
                </Typography>
              )}
            </Box>
            <Divider />
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
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <Toolbar />
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
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
