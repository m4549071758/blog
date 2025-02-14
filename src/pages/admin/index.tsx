import Link from 'next/link';
import { MainLayout } from '@/components/features/app/Layout';

const AdminPage = () => {
  return (
    <MainLayout
      main={
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-4">ダッシュボード</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <a>
                <div className="bg-white p-4 shadow rounded">
                  <h3 className="text-xl font-semibold mb-2">ユーザー管理</h3>
                  <p>ユーザーの管理を行います。</p>
                </div>
              </a>
            </Link>
            <Link href="/admin/new_post">
              <a>
                <div className="bg-white p-4 shadow rounded">
                  <h3 className="text-xl font-semibold mb-2">新規投稿</h3>
                  <p>新規投稿を行います。</p>
                </div>
              </a>
            </Link>
            <Link href="/admin/cms">
              <a>
                <div className="bg-white p-4 shadow rounded">
                  <h3 className="text-xl font-semibold mb-2">コンテンツ管理</h3>
                  <p>コンテンツの管理を行います。</p>
                </div>
              </a>
            </Link>
            <div className="bg-white p-4 shadow rounded">
              <h3 className="text-xl font-semibold mb-2">設定</h3>
              <p>サイトの設定を行います。</p>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default AdminPage;
