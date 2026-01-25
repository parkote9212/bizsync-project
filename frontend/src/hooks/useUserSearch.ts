import { useState, useCallback, useRef, useEffect } from "react";
import client from "../api/client";
import type { UserSearchResult } from "../types/user";

/**
 * 사용자 검색 옵션 인터페이스
 *
 * @interface UseUserSearchOptions
 * @property {number} [minKeywordLength=2] - 검색을 시작할 최소 키워드 길이
 * @property {number} [debounceMs=300] - 디바운싱 지연 시간 (밀리초)
 */
interface UseUserSearchOptions {
  minKeywordLength?: number;
  debounceMs?: number;
}

/**
 * 사용자 검색을 관리하는 커스텀 훅
 *
 * <p>디바운싱과 최소 글자 수 검증이 내장되어 있습니다.
 * 사용자가 입력하는 동안 불필요한 API 호출을 방지하고,
 * 최소 글자 수를 만족할 때만 검색을 수행합니다.
 *
 * @example
 * ```tsx
 * const { searchOptions, searchLoading, handleSearchUsers, clearSearch } = useUserSearch({
 *   minKeywordLength: 2,
 *   debounceMs: 300
 * });
 *
 * return (
 *   <Autocomplete
 *     options={searchOptions}
 *     loading={searchLoading}
 *     onInputChange={(_, value) => handleSearchUsers(value)}
 *     renderInput={(params) => (
 *       <TextField {...params} label="사용자 검색" />
 *     )}
 *   />
 * );
 * ```
 *
 * @param {UseUserSearchOptions} [options={}] - 검색 옵션
 * @returns {Object} 검색 관련 상태와 함수
 * @returns {UserSearchResult[]} searchOptions - 검색 결과 사용자 목록
 * @returns {boolean} searchLoading - 검색 로딩 상태
 * @returns {Function} handleSearchUsers - 사용자 검색을 실행하는 함수
 * @returns {string} handleSearchUsers.keyword - 검색 키워드
 * @returns {Function} clearSearch - 검색 결과를 초기화하는 함수
 */
export const useUserSearch = (options: UseUserSearchOptions = {}) => {
  const { minKeywordLength = 2, debounceMs = 300 } = options;

  const [searchOptions, setSearchOptions] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchUsers = useCallback(async (keyword: string) => {
    // 최소 글자 수 검증
    if (!keyword || keyword.length < minKeywordLength) {
      setSearchOptions([]);
      return;
    }

    // 디바운싱: 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 새 타이머 설정
    debounceTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await client.get(`/users/search?keyword=${keyword}`);
        setSearchOptions(response.data.data || []);
      } catch (error) {
        console.error("사용자 검색 실패:", error);
        setSearchOptions([]);
      } finally {
        setSearchLoading(false);
      }
    }, debounceMs);
  }, [minKeywordLength, debounceMs]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const clearSearch = useCallback(() => {
    setSearchOptions([]);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  return {
    searchOptions,
    searchLoading,
    handleSearchUsers,
    clearSearch,
  };
};
