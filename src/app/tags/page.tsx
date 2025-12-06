import { getAllPosts } from '@/lib/api';
import { Tags } from '@/components/pages/tags';
import { Profile } from '@/components/features/app/Profile';

export default async function TagsPage() {
  const posts = await getAllPosts(['tags']);
  
  // すべてのタグを取得
  let tags = posts.flatMap((post) => post.tags || []);
  
  // 重複を削除してソート
  tags = Array.from(new Set(tags)).sort();

  return <Tags tags={tags} profile={<Profile />} />;
}
