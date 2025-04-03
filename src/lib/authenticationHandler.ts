import Cookies from 'js-cookie';

// トークンを取得
export const getAuthToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

// ユーザーIDを取得
export const getUserId = (): string | undefined => {
  return Cookies.get('user_id');
};

// トークンが有効かどうかをAPIに問い合わせる
export const validateToken = async (): Promise<boolean> => {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const response = await fetch('http://localhost:8080/api/is_Auth', {
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
};

// ログアウト処理
export const logout = (): void => {
  Cookies.remove('auth_token');
  Cookies.remove('user_id');
  window.location.href = '/admin/login';
};

// API呼び出し用の認証ヘッダーを生成
export const authHeader = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
