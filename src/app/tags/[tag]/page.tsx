import { getAllPosts } from '@/lib/api';
import { Tag } from '@/components/pages/tag';
import { notFound } from 'next/navigation';
import { Profile } from '@/components/features/app/Profile';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `記事一覧: ${decodedTag} | Katori's blog`,
    description: `「${decodedTag}」タグに関連する記事の一覧です。ProxmoxやNext.jsなど、技術的な知見を発信しています。`,
    keywords: [decodedTag, 'Proxmox', '技術ブログ', '記事一覧'],
  };
}

// 静的パスの生成
export async function generateStaticParams() {
  const posts = await getAllPosts(['tags']);
  const tags = posts.flatMap((post) => post.tags || []);
  const uniqueTags = Array.from(new Set(tags));
  
  console.log('Generating static params for tags. Count:', uniqueTags.length);

  if (uniqueTags.length === 0) {
    return [{ tag: 'all' }];
  }

  return uniqueTags.map((tag) => ({
    tag: tag,
  }));
}

// ページコンポーネント
export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const allPosts = await getAllPosts([
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  const posts = allPosts.filter((post) => post.tags?.includes(decodedTag));

  // タグに記事がない場合は404
  if (posts.length === 0) {
    notFound();
  }

  return <Tag posts={posts as any} tag={decodedTag} profile={<Profile />} />;
}
