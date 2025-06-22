const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 環境変数の設定（開発時は localhost、本番時は実際のドメイン）
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
        date: data.date,
        title: data.title,
      };
    })
    .filter((post) => post.slug && post.date) // 必要なデータがあるもののみ
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return posts;
}

// サイトマップXMLを生成する関数
function generateSiteMap(posts) {
  const currentDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/posts</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tags</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Dynamic pages -->
  ${posts
    .map((post) => {
      return `  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('\n')}
</urlset>`;
}

// メイン処理
function main() {
  try {
    console.log('🗺️  サイトマップを生成中...');

    const posts = getAllPosts();
    const sitemap = generateSiteMap(posts);

    // publicディレクトリにサイトマップを出力
    const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);

    console.log(`✅ サイトマップが生成されました: ${outputPath}`);
    console.log(`📊 記事数: ${posts.length}`);
  } catch (error) {
    console.error('❌ サイトマップ生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

main();
