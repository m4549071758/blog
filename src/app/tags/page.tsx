import { getAllPosts } from '@/lib/api';
import { Tags } from '@/components/pages/tags';
import { Profile } from '@/components/features/app/Profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tags | Katori\'s blog',
  description: 'Katori\'s blogで公開されている記事をタグ（カテゴリ）ごとに一覧表示しています。興味のある技術トピックから記事を探すことができます。',
  keywords: ['タグ一覧', 'カテゴリ', '技術トピック', 'Proxmox', 'Next.js'],
};

export default async function TagsPage() {
  const posts = await getAllPosts(['tags']);
  
  // すべてのタグを取得
  let tags = posts.flatMap((post) => post.tags || []);
  
  // 重複を削除してソート
  tags = Array.from(new Set(tags)).sort();

  return <Tags tags={tags} profile={<Profile />} />;
}
