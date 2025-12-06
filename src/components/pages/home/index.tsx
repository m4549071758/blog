'use client';

import { useEffect, useState } from 'react';
import { RiChatNewLine } from 'react-icons/ri';
import { Link } from '@/components/common/Link';
import { MainLayout } from '@/components/features/app/Layout';
import { Profile } from '@/components/features/app/Profile';
import { Stories, StoriesSkeleton } from '@/components/features/story/Stories';
import { PostType } from '@/types/post';

type Props = {
  posts: PostType[];
};

export const Home: React.VFC<Props> = ({ posts }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 500msの遅延でスケルトンを表示してからコンテンツを表示
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout
      main={
        <div className="vstack gap-12 p-8 bg-primary-1">
          {isLoading ? (
            <StoriesSkeleton
              count={4}
              title="最新の記事"
              icon={<RiChatNewLine />}
            />
          ) : (
            <Stories
              posts={posts}
              title="最新の記事"
              icon={<RiChatNewLine />}
            />
          )}
          <Link href="/posts/page/1" className="button">
            記事一覧へ
          </Link>
        </div>
      }
      aside={<Profile />}
    />
  );
};
