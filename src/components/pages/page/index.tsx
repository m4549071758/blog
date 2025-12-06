'use client';

import { useEffect, useState } from 'react';
import { RiChatNewLine } from 'react-icons/ri';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { MainLayout } from '@/components/features/app/Layout';
import { Profile } from '@/components/features/app/Profile';
import { Pagination } from '@/components/features/story/Pagination';
import { Stories, StoriesSkeleton } from '@/components/features/story/Stories';
import { PostType } from '@/types/post';

type Props = {
  posts: PostType[];
  page: number;
  maxPage: number;
};

export const Page: React.VFC<Props> = ({ posts, page, maxPage }) => {
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbItems = [{ label: 'ブログ' }, { label: `ページ ${page}` }];

  useEffect(() => {
    // 700msの遅延でスケルトンを表示してからコンテンツを表示
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // ページが変わったときに再度ローディング状態にする
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [page]);

  return (
    <MainLayout
      main={
        <div className="vstack gap-10 p-8 bg-primary-1">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          {isLoading ? (
            <StoriesSkeleton
              count={10}
              title="記事一覧"
              icon={<RiChatNewLine />}
            />
          ) : (
            <Stories posts={posts} title="記事一覧" icon={<RiChatNewLine />} />
          )}
          <Pagination count={maxPage} page={page} />
        </div>
      }
      aside={<Profile />}
    />
  );
};
