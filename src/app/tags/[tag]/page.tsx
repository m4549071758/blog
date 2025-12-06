import { getAllPosts } from '@/lib/api';
import { Tag } from '@/components/pages/tag';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ tag: string }>;
};

// 静的パスの生成
export async function generateStaticParams() {
  const posts = await getAllPosts(['tags']);
  const tags = posts.flatMap((post) => post.tags || []);
  const uniqueTags = Array.from(new Set(tags));

  return uniqueTags.map((tag) => ({
    tag: tag,
  }));
}

// ページコンポーネント
export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const allPosts = await getAllPosts([
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  const posts = allPosts.filter((post) => post.tags?.includes(tag));

  // タグに記事がない場合は404
  if (posts.length === 0) {
    notFound();
  }

  return <Tag posts={posts as any} tag={tag} />;
}
