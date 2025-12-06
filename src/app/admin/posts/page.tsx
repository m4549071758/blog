'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainLayout } from '@/components/features/app/Layout';
import { authHeader } from '@/lib/authenticationHandler';

// 記事データの型定義
interface Article {
  article_id: string;
  title: string;
  excerpt: string;
}

export default function AdminPosts() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 記事一覧を取得する
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://www.katori.dev/api/articles', {
          cache: 'no-store',
          headers: {
            ...authHeader(),
          },
        });

        if (!response.ok) {
          throw new Error('記事の取得に失敗しました');
        }

        const data = await response.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('記事一覧取得エラー:', err);
        setError(
          err instanceof Error
            ? err.message
            : '記事の取得中にエラーが発生しました',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // 記事削除の処理
  const handleDelete = async (articleId: string) => {
    if (!confirm('この記事を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(
        `https://www.katori.dev/api/articles/${articleId}`,
        {
          method: 'DELETE',
          headers: {
            ...authHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error('記事の削除に失敗しました');
      }

      // 成功したら記事一覧から削除
      setArticles(
        articles.filter((article) => article.article_id !== articleId),
      );
    } catch (err) {
      console.error('記事削除エラー:', err);
      alert('記事の削除中にエラーが発生しました');
    }
  };

  const postsContent = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-1">記事一覧</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新規記事作成
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-primary-1 rounded shadow overflow-hidden">
          {articles.length === 0 ? (
            <div className="p-6 text-center text-secondary-1">
              記事がありません。新しい記事を作成してください。
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    タイトル
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    抜粋
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {articles.map((article) => (
                  <tr key={article.article_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-1">
                        {article.title}
                      </div>
                      <div className="text-sm text-secondary-1">
                        ID: {article.article_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-secondary-1 line-clamp-2">
                        {article.excerpt}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/posts/edit?id=${article.article_id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(article.article_id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                        >
                          削除
                        </button>
                        <Link
                          href={`/posts/${article.article_id}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-900 dark:text-green-400"
                        >
                          表示
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      <MainLayout main={postsContent}></MainLayout>
    </ProtectedRoute>
  );
}
