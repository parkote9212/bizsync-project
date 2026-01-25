import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";

interface Column<T> {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

/**
 * 재사용 가능한 데이터 테이블 컴포넌트
 *
 * <p>제네릭 타입을 지원하는 범용 테이블 컴포넌트입니다.
 * 로딩 상태, 빈 데이터 상태, 행 클릭 이벤트를 지원합니다.
 *
 * @component
 * @template T 테이블 행 데이터 타입
 * @param {DataTableProps<T>} props - DataTable 컴포넌트 props
 * @param {Column<T>[]} props.columns - 테이블 컬럼 정의 배열
 * @param {T[]} props.data - 테이블 데이터 배열
 * @param {boolean} [props.loading=false] - 로딩 상태
 * @param {string} [props.emptyMessage="데이터가 없습니다."] - 빈 데이터 메시지
 * @param {Function} [props.onRowClick] - 행 클릭 시 호출되는 함수
 *
 * @example
 * ```tsx
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const columns: Column<User>[] = [
 *   { id: "name", label: "이름" },
 *   { id: "email", label: "이메일" },
 *   { id: "id", label: "ID", render: (row) => `#${row.id}` }
 * ];
 *
 * return (
 *   <DataTable
 *     columns={columns}
 *     data={users}
 *     loading={isLoading}
 *     onRowClick={(user) => console.log("선택된 사용자:", user)}
 *   />
 * );
 * ```
 */
export function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  loading = false,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress />
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="body2" color="text.secondary" py={4}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} align={column.align || "left"}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={onRowClick ? { cursor: "pointer" } : {}}
            >
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align || "left"}>
                  {column.render ? column.render(row) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
