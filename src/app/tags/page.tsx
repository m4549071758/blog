import { getAllPosts } from '@/lib/api';
import { Tags } from '@/components/pages/tags';
import { Profile } from '@/components/features/app/Profile';
import { createPageMetadata } from '@/lib/metadata';

export function generateMetadata() {
  return createPageMetadata(
    'タグ一覧',
    '公開記事をタグごとに一覧表示しています。興味のある技術トピックや体験記から記事を探せます。',
    '/tags/',
  );
}

export default async function TagsPage() {
  const posts = await getAllPosts(['tags']);

  // すべてのタグを取得
  let tags = posts.flatMap((post) => post.tags || []);

  // 重複を削除してソート
  tags = Array.from(new Set(tags)).sort();

  return <Tags tags={tags} profile={<Profile />} />;
}
