import { getAllPosts } from '@/lib/api';
import { Home } from '@/components/pages/home';

import { Profile } from '@/components/features/app/Profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Katori's blog - プログラミングとライフスタイルの技術ブログ",
  description:
    'プログラミング、技術的な備忘録、ライフスタイルについて発信しているKatoriのブログです。最新の開発手法や技術解説などの記事を掲載しています。',
  keywords: ['Proxmox', 'Next.js', 'TypeScript', 'プログラミング', '技術ブログ', 'セルフホスト'],
};

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
