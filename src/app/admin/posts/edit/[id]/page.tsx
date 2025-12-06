import { getPostSlugs } from '@/lib/api';
import EditPostForm from './EditPostForm';

// 静的エクスポート用にパスを生成
export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs();
    // APIが空配列を返す場合もあるのでチェック
    if (!slugs || slugs.length === 0) {
      return [];
    }
    return slugs.map((slug: string) => ({
      id: slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default function EditPostPage() {
  return <EditPostForm />;
}
