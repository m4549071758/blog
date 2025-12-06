'use client';

import { FaHashtag } from 'react-icons/fa';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { MainLayout } from '@/components/features/app/Layout';
import { Stories } from '@/components/features/story/Stories';
import { PostType } from '@/types/post';

type Props = {
  posts: PostType[];
  tag: string;
  profile?: React.ReactNode;
};

export const Tag: React.VFC<Props> = ({ posts, tag, profile }) => {
  const breadcrumbItems = [
    { label: 'タグ', href: '/tags' },
    { label: `#${tag}` },
  ];

  return (
    <MainLayout
      main={
        <div className="p-8 bg-primary-1">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <Stories posts={posts} title={tag} icon={<FaHashtag />} />
        </div>
      }
      aside={profile}
    />
  );
};
