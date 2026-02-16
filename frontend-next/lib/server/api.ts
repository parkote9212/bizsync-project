/**
 * BFF (Backend for Frontend) API 클라이언트
 * Next.js API Routes에서 Spring Boot 백엔드와 통신
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api';

/**
 * 서버사이드 전용 백엔드 API 클라이언트
 */
class BackendApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * GET 요청
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * POST 요청
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT 요청
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH 요청
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * 인증 토큰을 포함한 요청
   */
  withAuth(token: string) {
    const authenticatedClient = axios.create({
      baseURL: BACKEND_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return {
      get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await authenticatedClient.get<T>(url, config);
        return response.data;
      },
      post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await authenticatedClient.post<T>(url, data, config);
        return response.data;
      },
      put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await authenticatedClient.put<T>(url, data, config);
        return response.data;
      },
      patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await authenticatedClient.patch<T>(url, data, config);
        return response.data;
      },
      delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await authenticatedClient.delete<T>(url, config);
        return response.data;
      },
    };
  }
}

const backendApi = new BackendApiClient();
export { backendApi };
export default backendApi;
