import { useState, useCallback } from "react";

/**
 * 로딩 상태를 관리하는 커스텀 훅
 *
 * <p>키 기반으로 여러 로딩 상태를 동시에 관리할 수 있습니다.
 * 여러 비동기 작업의 로딩 상태를 독립적으로 관리할 때 유용합니다.
 *
 * @example
 * ```tsx
 * const { setLoading, isLoading, clearLoading } = useLoading();
 *
 * const fetchUsers = async () => {
 *   setLoading("fetchUsers", true);
 *   try {
 *     await loadUsers();
 *   } finally {
 *     setLoading("fetchUsers", false);
 *   }
 * };
 *
 * const fetchProjects = async () => {
 *   setLoading("fetchProjects", true);
 *   try {
 *     await loadProjects();
 *   } finally {
 *     setLoading("fetchProjects", false);
 *   }
 * };
 *
 * return (
 *   <>
 *     {isLoading("fetchUsers") && <CircularProgress />}
 *     {isLoading("fetchProjects") && <CircularProgress />}
 *   </>
 * );
 * ```
 *
 * @returns {Object} 로딩 상태 관리 함수들
 * @returns {Function} setLoading - 특정 키의 로딩 상태를 설정하는 함수
 * @returns {string} setLoading.key - 로딩 상태를 구분할 키
 * @returns {boolean} setLoading.isLoading - 로딩 상태
 * @returns {Function} isLoading - 특정 키의 로딩 상태를 확인하는 함수
 * @returns {string} isLoading.key - 확인할 로딩 상태 키
 * @returns {Function} clearLoading - 특정 키의 로딩 상태를 제거하는 함수
 * @returns {string} clearLoading.key - 제거할 로딩 상태 키
 * @returns {Function} clearAllLoading - 모든 로딩 상태를 초기화하는 함수
 * @returns {Record<string, boolean>} loadingStates - 모든 로딩 상태 객체
 */
export const useLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const clearLoading = useCallback((key: string) => {
    setLoadingStates((prev) => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    setLoading,
    isLoading,
    clearLoading,
    clearAllLoading,
    loadingStates,
  };
};
