const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.katori.dev';

interface LoginResponse {
  message: string;
  user_id: string;
}

interface LoginResult {
  success: boolean;
  message: string;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
      // Cookieを受け取るために追加
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'ログインに失敗しました',
      };
    }

    const data: LoginResponse = await response.json();

    // クライアント側でのCookieセットは廃止

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('ログインエラー:', error);
    return {
      success: false,
      message: 'ネットワークエラーが発生しました',
    };
  }
}

// クライアントサイドでのトークン取得は廃止
export function getAuthToken(): string | undefined {
  return undefined;
}

export function getUserId(): string | undefined {
  return undefined;
}

export function getAuthMessage(): string | undefined {
  return undefined;
}

export function isAuthenticated(): boolean {
  // isAuthenticated()の呼び出し箇所はvalidateToken()の結果を待つように変更が必要
  return false;
}

export function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

// トークンが有効かどうかをAPIに問い合わせる
export async function validateToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/is_Auth`, {
      method: 'GET',
      credentials: 'include',
    });

    return response.status === 200;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    window.location.href = '/admin/login';
  }
}
