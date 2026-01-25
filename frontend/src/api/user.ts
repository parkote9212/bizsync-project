import client from "./client";
import type { UserSearchResult, PageResponse } from "../types/user";

/**
 * 사용자 관련 API
 *
 * <p>사용자 검색 등의 사용자 관련 API를 제공합니다.
 */
export const userApi = {
  /**
   * 키워드로 사용자를 검색합니다.
   *
   * <p>이름 또는 이메일로 사용자를 검색합니다.
   * 최소 2글자 이상 입력해야 검색이 수행됩니다.
   *
   * @param {string} keyword - 검색 키워드 (이름 또는 이메일)
   * @returns {Promise<UserSearchResult[]>} 사용자 검색 결과 목록
   * @throws {Error} API 호출 실패 시 에러 발생
   *
   * @example
   * ```ts
   * const users = await userApi.searchUsers("홍길동");
   * console.log(users); // [{ userId: 1, name: "홍길동", email: "hong@example.com", ... }]
   * ```
   */
  searchUsers: async (keyword: string): Promise<UserSearchResult[]> => {
    const response = await client.get<{ data: UserSearchResult[] }>(`/users/search?keyword=${keyword}`);
    return response.data.data || [];
  },
};
