import { GetServerSideProps } from 'next';
import { getAllPosts } from '@/lib/api';

const generateRSS = (posts: any[]) => {
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_URL;
  const currentDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Katori's blog</title>
    <link>${baseUrl}</link>
    <description>Katori's Tech blog - プログラミング、技術、ライフスタイルについて</description>
    <language>ja</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    
    ${posts
      .map((post) => {
        return `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${baseUrl}/posts/${post.slug}</link>
        <description><![CDATA[${post.excerpt}]]></description>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
        ${
          post.tags
            ?.map((tag: string) => `<category>${tag}</category>`)
            .join('') || ''
        }
      </item>
    `;
      })
      .join('')}
  </channel>
</rss>`;
};

const Feed = () => {
  // getServerSideProps will do the heavy lifting
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = await getAllPosts(['title', 'slug', 'date', 'excerpt', 'tags']);

  const rss = generateRSS(posts);

  res.setHeader('Content-Type', 'text/xml');
  res.write(rss);
  res.end();

  return {
    props: {},
  };
};

export default Feed;
