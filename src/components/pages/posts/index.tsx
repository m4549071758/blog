'use client';


import { Breadcrumb } from '@/components/common/Breadcrumb';
import { ArticleStructuredData } from '@/components/common/StructuredData';
import { MainLayout } from '@/components/features/app/Layout';
import { Profile } from '@/components/features/app/Profile';
import { Post } from '@/components/features/post/Post';
import { Share } from '@/components/features/post/Share';
import { Toc } from '@/components/features/post/Toc';
import { ROOT_URL } from '@/config/app';
import { generateArticleMeta } from '@/config/seo';
import { useBreakPoint } from '@/hooks/useBreakPoint';
import { joinPath } from '@/lib/joinPath';
import { PostType } from '@/types/post';

type Props = {
  post: PostType;
};

export const Posts: React.VFC<Props> = ({ post }) => {
  const lg = useBreakPoint('lg');
  const imageURL = joinPath(ROOT_URL, post.ogImage.url);
  const postURL = joinPath(ROOT_URL, `/posts/${post.slug}`);
  const breadcrumbItems = [
    { label: 'ブログ', href: '/posts' },
    { label: post.title },
  ];

  const seoMeta = generateArticleMeta(post);

  return (
    <>

      <ArticleStructuredData
        title={post.title}
        description={post.excerpt}
        datePublished={post.date}
        dateModified={post.date}
        author="Katori"
        url={postURL}
        imageUrl={imageURL}
        tags={post.tags}
      />
      <MainLayout
        main={
          <>
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>
            <article>
              <Post post={post} />
            </article>
          </>
        }
        aside={
          <div className="vstack gap-10 h-full">
            <Profile />
            <div className="vstack gap-10 sticky top-20">
              {lg && <Toc />}
              <Share post={post} />
            </div>
          </div>
        }
        hamburgerMenu={
          <div
            role="button"
            tabIndex={0}
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape' }),
              )
            }
            onKeyDown={() => {}}
            className="overflow-y-auto cursor-default"
          >
            <Toc />
          </div>
        }
      />
    </>
  );
};
