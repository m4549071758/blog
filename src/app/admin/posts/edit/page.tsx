import { Suspense } from 'react';
import EditPostForm from './EditPostForm';
import { AdminLayout } from '@/components/features/admin/AdminLayout';

export default function EditPostPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-4 text-center">読み込み中...</div>}>
        <EditPostForm />
      </Suspense>
    </AdminLayout>
  );
}
