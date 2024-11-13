import { AdminLayout } from '@/components/features/admin/AdminLayout';

const AdminPage = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4">ダッシュボード</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-xl font-semibold mb-2">ユーザー管理</h3>
            <p>ユーザーの管理を行います。</p>
          </div>
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-xl font-semibold mb-2">コンテンツ管理</h3>
            <p>コンテンツの管理を行います。</p>
          </div>
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-xl font-semibold mb-2">設定</h3>
            <p>サイトの設定を行います。</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
