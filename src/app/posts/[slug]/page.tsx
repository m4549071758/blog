import { getPostBySlug, getAllPosts } from '@/lib/api';
import markdownToHtml from '@/lib/markdownToHtml';
import { Posts } from '@/components/pages/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Profile } from '@/components/features/app/Profile';
import { getSiteConfig } from '@/lib/siteConfig';
import { ROOT_URL } from '@/config/app';
import type { PostType } from '@/types/post';

type Props = {
  params: Promise<{ slug: string }>;
};

// 静的パスの生成
export async function generateStaticParams() {
  const posts = await getAllPosts(['slug']);

  return posts
    .filter((post) => post.slug)
    .map((post) => ({
      slug: post.slug,
    }));
}

// メタデータの生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, [
    'title',
    'excerpt',
    'seoTitle',
    'seoDescription',
    'ogImage',
    'date',
    'tags',
  ]);
  if (!post.title) notFound();

  const url = new URL(`/posts/${slug}/`, ROOT_URL).href;
  const metadataTitle = post.seoTitle || post.title;
  const metadataDescription = post.seoDescription || post.excerpt;
  return {
    title: metadataTitle,
    description: metadataDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: metadataTitle,
      description: metadataDescription,
      url,
      publishedTime: post.date,
      authors: [new URL('/about/', ROOT_URL).href],
      tags: post.tags,
      images: post.ogImage?.url
        ? [new URL(post.ogImage.url, ROOT_URL).href]
        : [],
    },
  };
}

// ページコンポーネント
export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, [
    'id',
    'title',
    'date',
    'slug',
    'content',
    'ogImage',
    'coverImage',
    'excerpt',
    'tags',
  ]);
  if (!post.title) notFound();

  const content = await markdownToHtml(post.content || '');
  const siteConfig = await getSiteConfig();
  return (
    <Posts
      post={{ ...post, content } as PostType}
      profile={<Profile />}
      siteConfig={siteConfig}
    />
  );
}
