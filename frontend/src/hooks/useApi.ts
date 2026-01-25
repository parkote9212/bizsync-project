import { useState, useCallback } from "react";
import { useToast } from "./useToast";
import { useLoading } from "./useLoading";

/**
 * API 호출 옵션 인터페이스
 *
 * @interface UseApiOptions
 * @property {boolean} [showToastOnError=true] - 에러 발생 시 Toast 표시 여부
 * @property {boolean} [showToastOnSuccess=false] - 성공 시 Toast 표시 여부
 * @property {string} [successMessage] - 성공 시 표시할 메시지
 * @property {string} [loadingKey="default"] - 로딩 상태를 구분할 키
 */
interface UseApiOptions {
  showToastOnError?: boolean;
  showToastOnSuccess?: boolean;
  successMessage?: string;
  loadingKey?: string;
}

/**
 * API 호출을 관리하는 커스텀 훅
 *
 * <p>자동 에러 처리, Toast 표시, 로딩 상태 관리를 제공합니다.
 * API 호출 시 발생하는 에러를 자동으로 처리하고, 필요시 Toast 알림을 표시합니다.
 *
 * @template T API 호출 결과 데이터 타입
 *
 * @example
 * ```tsx
 * const { execute, data, error, isLoading } = useApi<User[]>({
 *   showToastOnError: true,
 *   showToastOnSuccess: true,
 *   successMessage: "사용자 목록을 불러왔습니다.",
 *   loadingKey: "fetchUsers"
 * });
 *
 * const fetchUsers = async () => {
 *   const result = await execute(async () => {
 *     const response = await client.get("/users");
 *     return response.data;
 *   });
 *
 *   if (result) {
 *     console.log("사용자 목록:", result);
 *   }
 * };
 * ```
 *
 * @param {UseApiOptions} [options={}] - API 호출 옵션
 * @returns {Object} API 호출 관련 함수와 상태
 * @returns {Function} execute - API 호출을 실행하는 함수
 * @returns {T|null} data - API 호출 결과 데이터
 * @returns {Error|null} error - 발생한 에러 객체
 * @returns {boolean} isLoading - 로딩 상태
 */
export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const {
    loadingKey = "default",
  } = options;

  const { showToast } = useToast();
  const { setLoading, isLoading } = useLoading();
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async <R = T>(
    apiCall: () => Promise<R>,
    customOptions?: Partial<UseApiOptions>
  ): Promise<R | null> => {
    const opts = { 
      showToastOnError: true,
      showToastOnSuccess: false,
      successMessage: undefined,
      ...options, 
      ...customOptions 
    };
    const key = customOptions?.loadingKey || loadingKey;

    try {
      setLoading(key, true);
      setError(null);
      const result = await apiCall();
      setData(result as T);
      
      if (opts.showToastOnSuccess && opts.successMessage) {
        showToast(opts.successMessage, "success");
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "오류가 발생했습니다.";
      const error = new Error(errorMessage);
      setError(error);
      
      if (opts.showToastOnError) {
        showToast(errorMessage, "error");
      }
      
      console.error("API 호출 실패:", err);
      return null;
    } finally {
      setLoading(key, false);
    }
  }, [showToast, setLoading, loadingKey, options]);

  return {
    execute,
    data,
    error,
    isLoading: isLoading(loadingKey),
  };
};

/**
 * Mutation (POST, PUT, DELETE) 전용 커스텀 훅
 *
 * <p>데이터 변경 작업에 특화된 훅으로, 기본적으로 성공 시 Toast를 표시합니다.
 * useApi를 래핑하여 더 간편하게 사용할 수 있습니다.
 *
 * @template T Mutation 결과 데이터 타입
 *
 * @example
 * ```tsx
 * const { execute, isLoading } = useMutation({
 *   successMessage: "사용자가 생성되었습니다.",
 *   loadingKey: "createUser"
 * });
 *
 * const handleCreate = async () => {
 *   await execute(async () => {
 *     await client.post("/users", userData);
 *   });
 * };
 * ```
 *
 * @param {UseApiOptions} [options={}] - Mutation 옵션
 * @returns {Object} useApi와 동일한 반환값
 */
export const useMutation = <T = any>(options: UseApiOptions = {}) => {
  return useApi<T>({ ...options, showToastOnSuccess: options.showToastOnSuccess ?? true });
};
