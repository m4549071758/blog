'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { MainLayout } from '@/components/features/app/Layout';
import { login } from '@/lib/authHandler';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(username, password);

      if (result.success) {
        // ダッシュボードページへリダイレクト
        router.push('/admin');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const loginForm = (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">ログイン</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="username">
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
