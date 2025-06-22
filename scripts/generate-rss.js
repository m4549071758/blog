const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 環境変数の設定
const baseUrl = process.env.NEXT_PUBLIC_ROOT_URL || 'http://localhost:3000';

// 記事データを取得する関数
function getAllPosts() {
  const postsDirectory = path.join(process.cwd(), '_posts');
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const fullPath = path.join(postsDirectory, name);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug: data.slug || name.replace(/\.md$/, ''),
        title: data.title,
        date: data.date,
        excerpt: data.excerpt || '',
        tags: data.tags || [],
      };
    })
    .filter((post) => post.slug && post.title && post.date) // 必要なデータがあるもののみ
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20); // 最新20件

  return posts;
}

// RSS XMLを生成する関数
function generateRSS(posts) {
  const currentDate = new Date().toUTCString();

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
        const postUrl = `${baseUrl}/posts/${post.slug}`;
        const pubDate = new Date(post.date).toUTCString();
        const categories =
          post.tags
            ?.map((tag) => `<category>${escapeXml(tag)}</category>`)
            .join('\n        ') || '';

        return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${postUrl}</guid>
      ${categories ? `      ${categories}` : ''}
    </item>`;
      })
      .join('\n')}
  </channel>
</rss>`;
}

// XML特殊文字をエスケープする関数
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// メイン処理
function main() {
  try {
    console.log('📡 RSSフィードを生成中...');

    const posts = getAllPosts();
    const rss = generateRSS(posts);

    // publicディレクトリにRSSフィードを出力
    const outputPath = path.join(process.cwd(), 'public', 'feed.xml');
    fs.writeFileSync(outputPath, rss);

    console.log(`✅ RSSフィードが生成されました: ${outputPath}`);
    console.log(`📊 記事数: ${posts.length}`);
  } catch (error) {
    console.error('❌ RSSフィード生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

main();
