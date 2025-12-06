import { getAllPosts } from '@/lib/api';
import { Home } from '@/components/pages/home';

import { Profile } from '@/components/features/app/Profile';

export default async function HomePage() {
  // サーバーコンポーネントで直接データ取得
  const posts = await getAllPosts([
    'id',
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
    'like_count',
  ]);

  // 最初の4件のみを取得
  const limitedPosts = posts.slice(0, 4);

  return <Home posts={limitedPosts as any} profile={<Profile />} />;
}
