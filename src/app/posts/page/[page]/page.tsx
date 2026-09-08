import { getPaginatedPosts, getMaxPage } from '@/lib/api';
import { Page } from '@/components/pages/page';
import { notFound } from 'next/navigation';
import { Profile } from '@/components/features/app/Profile';
import type { Metadata } from 'next';
import type { PostType } from '@/types/post';
import { createPageMetadata } from '@/lib/metadata';

type Props = {
  params: Promise<{ page: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  return createPageMetadata(
    `記事一覧 - ${page}ページ目`,
    `公開記事の一覧、${page}ページ目です。記事タイトルから技術情報や体験記を探せます。`,
    page === '1' ? '/posts/' : `/posts/page/${page}/`,
  );
}

// 静的パスの生成
export async function generateStaticParams() {
  const maxPage = await getMaxPage();
  console.log('Generating static params for pages. Max page:', maxPage);

  if (maxPage === 0) {
    return [{ page: '1' }];
  }

  return Array.from({ length: maxPage }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}

// ページコンポーネント
export default async function PaginationPage({ params }: Props) {
  const { page: pageStr } = await params;
  const page = Number(pageStr);
  const maxPage = await getMaxPage();

  // ページ番号が範囲外の場合は404
  if (!Number.isInteger(page) || page < 1 || page > Math.max(1, maxPage)) {
    notFound();
  }

  const posts = await getPaginatedPosts(page, [
    'id',
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
    'tags',
    'like_count',
  ]);

  return (
    <Page
      posts={posts as PostType[]}
      page={page}
      maxPage={Math.max(1, maxPage)}
      profile={<Profile />}
    />
  );
}
