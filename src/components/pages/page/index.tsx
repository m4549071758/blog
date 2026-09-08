'use client';

import { RiChatNewLine } from 'react-icons/ri';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { MainLayout } from '@/components/features/app/Layout';
import { Pagination } from '@/components/features/story/Pagination';
import { Stories } from '@/components/features/story/Stories';
import { PostType } from '@/types/post';

type Props = {
  posts: PostType[];
  page: number;
  maxPage: number;
  profile?: React.ReactNode;
};

export const Page: React.VFC<Props> = ({ posts, page, maxPage, profile }) => {
  const breadcrumbItems = [
    { label: 'ブログ', url: '/posts/', href: '/posts/' },
    {
      label: `ページ ${page}`,
      url: page === 1 ? '/posts/' : `/posts/page/${page}/`,
    },
  ];

  return (
    <MainLayout
      main={
        <div className="vstack gap-10 p-8 bg-primary-1">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <Stories posts={posts} title="記事一覧" icon={<RiChatNewLine />} />
          <Pagination count={maxPage} page={page} />
        </div>
      }
      aside={profile}
    />
  );
};
