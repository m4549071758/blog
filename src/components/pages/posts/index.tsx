import { Breadcrumb } from '@/components/common/Breadcrumb';
import { ArticleStructuredData } from '@/components/common/StructuredData';
import { MainLayout } from '@/components/features/app/Layout';
import { Post } from '@/components/features/post/Post';
import { Share } from '@/components/features/post/Share';
import { DesktopToc, TocMenu } from '@/components/features/post/Toc';
import { ROOT_URL } from '@/config/app';
import { PostType } from '@/types/post';

import type { SiteConfig } from '@/lib/siteConfig';

type Props = {
  post: PostType;
  profile?: React.ReactNode;
  siteConfig?: SiteConfig | null;
};

export const Posts: React.VFC<Props> = ({ post, profile, siteConfig }) => {
  const imageURL = new URL(post.ogImage.url, ROOT_URL).href;
  const postURL = new URL(`/posts/${post.slug}/`, ROOT_URL).href;
  const breadcrumbItems = [
    { label: 'ブログ', url: '/posts/', href: '/posts/' },
    { label: post.title, url: `/posts/${post.slug}/` },
  ];

  return (
    <>
      <ArticleStructuredData
        title={post.title}
        description={post.excerpt}
        datePublished={post.date}
        authorName="かとり"
        authorUrl={new URL('/about/', ROOT_URL).href}
        publisherName={siteConfig?.site_title || "Katori's blog"}
        publisherLogoUrl={
          new URL(
            siteConfig?.publisher_logo_url || '/assets/author.webp',
            ROOT_URL,
          ).href
        }
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
            {profile}
            <div className="vstack gap-10 sticky top-20">
              <DesktopToc />
              <Share post={post} />
            </div>
          </div>
        }
        hamburgerMenu={<TocMenu />}
      />
    </>
  );
};
