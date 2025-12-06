import { Suspense } from 'react';
import EditPostForm from './EditPostForm';

export default function EditPostPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">読み込み中...</div>}>
      <EditPostForm />
    </Suspense>
  );
}
