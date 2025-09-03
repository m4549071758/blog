export const seoConfig = {
  siteName: "Katori's blog",
  siteDescription:
    "Katori's Tech blog - プログラミング、技術、ライフスタイルについての記事を投稿しています",
  siteUrl: process.env.NEXT_PUBLIC_ROOT_URL || 'https://localhost:3000',
  authorName: 'Katori',
  twitterHandle: '@katori_v2',
  defaultImage: '/assets/author.webp',
  locale: 'ja_JP',
  themeColor: '#000000',
  backgroundColor: '#ffffff',
};

export const generateArticleMeta = (post: {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  tags?: string[];
  ogImage: { url: string };
}) => {
  const url = `${seoConfig.siteUrl}/posts/${post.slug}`;
  // 投稿にOG画像がある場合はそれを使用、ない場合はデフォルト画像を使用
  const imageUrl = post.ogImage?.url
    ? post.ogImage.url.startsWith('http')
      ? post.ogImage.url
      : `${seoConfig.siteUrl}${post.ogImage.url}`
    : `${seoConfig.siteUrl}${seoConfig.defaultImage}`;

  return {
    title: `${post.title} | ${seoConfig.siteName}`,
    description: post.excerpt,
    canonical: url,
    openGraph: {
      type: 'article' as const,
      locale: seoConfig.locale,
      url,
      title: post.title,
      description: post.excerpt,
      siteName: seoConfig.siteName,
      article: {
        publishedTime: post.date,
        modifiedTime: post.date,
        authors: [seoConfig.authorName],
        tags: post.tags || [],
      },
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      handle: seoConfig.twitterHandle,
      site: seoConfig.twitterHandle,
      cardType: 'summary_large_image' as const,
    },
    additionalMetaTags: [
      {
        name: 'keywords',
        content: post.tags?.join(', ') || '',
      },
      {
        name: 'author',
        content: seoConfig.authorName,
      },
      {
        property: 'article:published_time',
        content: post.date,
      },
      {
        property: 'article:modified_time',
        content: post.date,
      },
    ],
  };
};
