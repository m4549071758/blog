import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '記事一覧 | 管理画面',
};

export default function AdminPostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
