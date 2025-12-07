import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.katori.dev';
const TOKEN_COOKIE_KEY = 'auth_token';
const USER_ID_COOKIE_KEY = 'user_id';
const MESSAGE_COOKIE_KEY = 'auth_message';

interface LoginResponse {
  message: string;
  token: string;
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
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'ログインに失敗しました',
      };
    }

    const data: LoginResponse = await response.json();

    Cookies.set(TOKEN_COOKIE_KEY, data.token, { expires: 7 });
    Cookies.set(USER_ID_COOKIE_KEY, data.user_id, { expires: 7 });
    Cookies.set(MESSAGE_COOKIE_KEY, data.message, { expires: 7 });

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

export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE_KEY);
}

export function getUserId(): string | undefined {
  return Cookies.get(USER_ID_COOKIE_KEY);
}

export function getAuthMessage(): string | undefined {
  return Cookies.get(MESSAGE_COOKIE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : {
        'Content-Type': 'application/json',
      };
}

// トークンが有効かどうかをAPIに問い合わせる
export async function validateToken(): Promise<boolean> {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/is_Auth`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export function logout(): void {
  Cookies.remove(TOKEN_COOKIE_KEY);
  Cookies.remove(USER_ID_COOKIE_KEY);
  Cookies.remove(MESSAGE_COOKIE_KEY);
  window.location.href = '/admin/login';
}
