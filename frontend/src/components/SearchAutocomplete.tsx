import React from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import type { UserSearchResult } from "../types/user";

interface SearchAutocompleteProps {
  value?: UserSearchResult | null;
  options: UserSearchResult[];
  loading?: boolean;
  label?: string;
  placeholder?: string;
  onChange?: (value: UserSearchResult | null) => void;
  onInputChange: (value: string) => void;
  multiple?: boolean;
  valueMultiple?: UserSearchResult[];
  onChangeMultiple?: (value: UserSearchResult[]) => void;
}

/**
 * 재사용 가능한 사용자 검색 Autocomplete 컴포넌트
 *
 * <p>사용자 검색을 위한 Autocomplete 컴포넌트입니다.
 * 단일 선택 또는 다중 선택을 지원하며, 로딩 상태와 검색 결과를 표시합니다.
 *
 * @component
 * @param {SearchAutocompleteProps} props - SearchAutocomplete 컴포넌트 props
 * @param {UserSearchResult|null} props.value - 선택된 사용자 (단일 선택 모드)
 * @param {UserSearchResult[]} props.options - 검색 결과 사용자 목록
 * @param {boolean} [props.loading=false] - 검색 로딩 상태
 * @param {string} [props.label="사용자 검색"] - 입력 필드 레이블
 * @param {string} [props.placeholder="최소 2글자 입력"] - 입력 필드 플레이스홀더
 * @param {Function} props.onChange - 사용자 선택 시 호출되는 함수 (단일 선택 모드)
 * @param {Function} props.onInputChange - 입력값 변경 시 호출되는 함수
 * @param {boolean} [props.multiple=false] - 다중 선택 모드 여부
 * @param {UserSearchResult[]} [props.valueMultiple] - 선택된 사용자 목록 (다중 선택 모드)
 * @param {Function} [props.onChangeMultiple] - 사용자 선택 시 호출되는 함수 (다중 선택 모드)
 *
 * @example
 * ```tsx
 * const { searchOptions, searchLoading, handleSearchUsers } = useUserSearch();
 * const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
 *
 * return (
 *   <SearchAutocomplete
 *     value={selectedUser}
 *     options={searchOptions}
 *     loading={searchLoading}
 *     label="사용자 검색"
 *     placeholder="최소 2글자 입력"
 *     onChange={setSelectedUser}
 *     onInputChange={handleSearchUsers}
 *   />
 * );
 * ```
 */
export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value = null,
  options,
  loading = false,
  label = "사용자 검색",
  placeholder = "최소 2글자 입력",
  onChange,
  onInputChange,
  multiple = false,
  valueMultiple,
  onChangeMultiple,
}) => {
  if (multiple) {
    return (
      <Autocomplete
        multiple
        options={options}
        value={valueMultiple || []}
        onChange={(_event, newValue) => {
          if (onChangeMultiple) {
            onChangeMultiple(newValue);
          }
        }}
        onInputChange={(_event, newInputValue) => {
          onInputChange(newInputValue);
        }}
        getOptionLabel={(option) => `${option.name} (${option.email})`}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.email}
              </Typography>
              {(option.position || option.department) && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {option.position && option.department
                    ? `${option.position} · ${option.department}`
                    : option.position || option.department}
                </Typography>
              )}
            </Box>
          </li>
        )}
        noOptionsText="검색 결과가 없습니다"
      />
    );
  }

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_event, newValue) => {
        if (onChange) {
          onChange(newValue);
        }
      }}
      onInputChange={(_event, newInputValue) => onInputChange(newInputValue)}
      getOptionLabel={(option) => `${option.name} (${option.email})`}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.email}
            </Typography>
            {(option.position || option.department) && (
              <Typography variant="caption" color="text.secondary" display="block">
                {option.position && option.department
                  ? `${option.position} · ${option.department}`
                  : option.position || option.department}
              </Typography>
            )}
          </Box>
        </li>
      )}
      noOptionsText="검색 결과가 없습니다"
    />
  );
};
