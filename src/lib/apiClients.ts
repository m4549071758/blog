import { authHeader, logout } from '@/lib/authenticationHandler';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const apiClient = async <T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> => {
  const { method = 'GET', body, headers = {} } = options;

  // 認証ヘッダーを追加
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...authHeader(),
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // 認証エラーの場合はログアウト
    if (response.status === 401) {
      logout();
      throw new Error('認証が無効になりました。再度ログインしてください。');
    }

    // 成功しなかった場合
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `API request failed with status ${response.status}`,
      );
    }

    // レスポンスがない場合
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};
