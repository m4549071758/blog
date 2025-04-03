import Head from 'next/head';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainLayout } from '@/components/features/app/Layout';
import { getUserId, logout } from '@/lib/authenticationHandler';

export default function AdminDashboard() {
  const userId = getUserId();

  const handleLogout = () => {
    logout();
  };

  const dashboardContent = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理ダッシュボード</h1>
        <div>
          <span className="mr-4">ユーザーID: {userId}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">記事管理</h2>
          <p className="text-gray-600 mb-3">記事の作成・編集・削除を行います</p>
          <Link href="/admin/posts" className="text-blue-500 hover:underline">
            記事一覧へ →
          </Link>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">メディア管理</h2>
          <p className="text-gray-600 mb-3">
            画像などのメディアファイルを管理します
          </p>
          <Link href="/admin/media" className="text-blue-500 hover:underline">
            メディア一覧へ →
          </Link>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">設定</h2>
          <p className="text-gray-600 mb-3">ブログの全体設定を行います</p>
          <Link
            href="/admin/settings"
            className="text-blue-500 hover:underline"
          >
            設定ページへ →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Head>
        <title>管理ダッシュボード | ブログ</title>
      </Head>
      <MainLayout main={dashboardContent}></MainLayout>
    </ProtectedRoute>
  );
}
