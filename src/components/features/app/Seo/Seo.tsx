'use client';

import { DefaultSeo } from 'next-seo';
import { WebsiteStructuredData } from '@/components/common/StructuredData';
import { ROOT_URL } from '@/config/app';
import { useRootPath } from '@/hooks/useRootPath';
import { joinPath } from '@/lib/joinPath';

export const Seo = () => {
  const rootPath = useRootPath();
  const imageURL = joinPath(ROOT_URL, '/assets/author.webp');

  return (
    <>
      <WebsiteStructuredData
        name="Katori's blog"
        url={ROOT_URL}
        description="Katori's Tech blog - プログラミング、技術、ライフスタイルについて"
      />
      <DefaultSeo
        defaultTitle="Katori's blog"
        titleTemplate="%s | Katori's blog"
        description="Katori's Tech blog - プログラミング、技術、ライフスタイルについての記事を投稿しています"
        canonical={ROOT_URL}
        openGraph={{
          type: 'website',
          locale: 'ja_JP',
          title: "Katori's blog",
          description:
            "Katori's Tech blog - プログラミング、技術、ライフスタイルについての記事を投稿しています",
          site_name: "Katori's blog",
          url: ROOT_URL,
          images: [
            {
              url: imageURL,
              width: 512,
              height: 512,
              alt: "Katori's blog ロゴ",
              type: 'image/webp',
            },
          ],
        }}
        twitter={{
          handle: '@katori_m',
          site: '@katori_m',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1',
          },
          {
            name: 'theme-color',
            content: '#000000',
          },
          {
            name: 'author',
            content: 'Katori',
          },
          {
            name: 'robots',
            content:
              'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
          {
            name: 'googlebot',
            content: 'index, follow',
          },
        ]}
        additionalLinkTags={[
          { rel: 'icon', href: `${rootPath}/favicon.ico` },
          {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            href: `${rootPath}/favicons/favicon-16x16.png`,
          },
          {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: `${rootPath}/favicons/favicon-32x32.png`,
          },
          {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: `${rootPath}/favicons/apple-touch-icon.png`,
          },
          {
            rel: 'mask-icon',
            href: `${rootPath}/favicons/safari-pinned-tab.svg`,
            color: '#5bbad5',
          },
          {
            rel: 'manifest',
            href: `${rootPath}/favicons/site.webmanifest`,
          },
          {
            rel: 'sitemap',
            type: 'application/xml',
            href: `${rootPath}/sitemap.xml`,
          },
          {
            rel: 'alternate',
            type: 'application/rss+xml',
            href: `${rootPath}/feed.xml`,
          },
          {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
          {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossOrigin: 'anonymous',
          },
        ]}
      />
    </>
  );
};
