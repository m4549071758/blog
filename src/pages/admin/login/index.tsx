import { useState } from 'react';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/features/app/Layout';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ログインに失敗しました');
      }

      // トークンとユーザーIDをCookieに保存
      // 1日間の有効期限を設定
      Cookies.set('auth_token', data.token, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
      });
      Cookies.set('user_id', data.user_id, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
      });

      // ダッシュボードページへリダイレクト
      const redirectTo = (router.query.redirectTo as string) || '/admin';
      router.push(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      setError('ユーザー名またはパスワードが正しくありません');
    } finally {
      setIsLoading(false);
    }
  };

  const loginForm = (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="username">
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );

  return (
    <>
      <Head>
        <title>ログイン | ブログ管理システム</title>
      </Head>
      <MainLayout main={loginForm}></MainLayout>
    </>
  );
}
