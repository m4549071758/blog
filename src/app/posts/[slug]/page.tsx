import { getPostBySlug, getAllPosts } from '@/lib/api';
import markdownToHtml from '@/lib/markdownToHtml';
import { Posts } from '@/components/pages/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

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
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug, ['title', 'excerpt', 'ogImage']);
    
    if (!post || !post.title) {
      return {
        title: '記事が見つかりません',
      };
    }

    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.ogImage?.url ? [post.ogImage.url] : [],
      },
    };
  } catch (error) {
    return {
      title: '記事が見つかりません',
    };
  }
}

// ページコンポーネント
export default async function PostPage({ params }: Props) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug, [
      'id',
      'title',
      'date',
      'slug',
      'author',
      'content',
      'ogImage',
      'coverImage',
      'excerpt',
      'tags',
    ]);

    // 記事が見つからない場合は404
    if (!post || !post.title) {
      notFound();
    }

    const content = await markdownToHtml(post.content || '');

    return <Posts post={{ ...post, content } as any} />;
  } catch (error) {
    console.error('Error in PostPage:', error);
    notFound();
  }
}
