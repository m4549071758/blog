'use client';

import { RiChatNewLine } from 'react-icons/ri';
import { Link } from '@/components/common/Link';
import { MainLayout } from '@/components/features/app/Layout';
import { Stories } from '@/components/features/story/Stories';
import { PostType } from '@/types/post';

type Props = {
  posts: PostType[];
  profile?: React.ReactNode;
};

export const Home: React.VFC<Props> = ({ posts, profile }) => {
  return (
    <MainLayout
      main={
        <div className="vstack gap-12 p-8 bg-primary-1">
          <Stories posts={posts} title="最新の記事" icon={<RiChatNewLine />} />
          <Link href="/posts/" className="button">
            記事一覧へ
          </Link>
        </div>
      }
      aside={profile}
    />
  );
};
