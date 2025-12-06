import { getPaginatedPosts, getMaxPage } from '@/lib/api';
import { Page } from '@/components/pages/page';
import { notFound } from 'next/navigation';
import { Profile } from '@/components/features/app/Profile';

type Props = {
  params: Promise<{ page: string }>;
};

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
  const page = parseInt(pageStr);
  const maxPage = await getMaxPage();

  // ページ番号が範囲外の場合は404
  if (page < 1 || page > maxPage) {
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

  return <Page posts={posts as any} page={page} maxPage={maxPage} profile={<Profile />} />;
}
