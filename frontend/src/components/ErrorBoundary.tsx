import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary 컴포넌트
 *
 * <p>예상치 못한 에러를 잡아서 사용자 친화적인 UI를 표시합니다.
 * React 컴포넌트 트리에서 발생하는 에러를 캐치하여 전체 애플리케이션이
 * 크래시되는 것을 방지합니다.
 *
 * @component
 * @class ErrorBoundary
 * @extends {Component<Props, State>}
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ErrorBoundary>
 *       <MyApp />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: "center",
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              오류가 발생했습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {this.state.error?.message || "예상치 못한 오류가 발생했습니다."}
            </Typography>
            <Button variant="contained" onClick={this.handleReset}>
              다시 시도
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
