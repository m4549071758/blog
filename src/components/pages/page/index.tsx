import { useRouter } from 'next/router';
import { RiChatNewLine } from 'react-icons/ri';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { MainLayout } from '@/components/features/app/Layout';
import { Profile } from '@/components/features/app/Profile';
import { Pagination } from '@/components/features/story/Pagination';
import { Stories } from '@/components/features/story/Stories';
import { PostType } from '@/types/post';

type Props = {
  posts: PostType[];
  maxPage: number;
};

export const Page: React.VFC<Props> = ({ posts, maxPage }) => {
  const page = Number(useRouter().query.page);

  const breadcrumbItems = [{ label: 'ブログ' }, { label: `ページ ${page}` }];

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
      aside={<Profile />}
    />
  );
};
