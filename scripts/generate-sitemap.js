const fs = require('fs');
const path = require('path');

// 本番ドメインをハードコード
// 本番ドメイン
const baseUrl = process.env.NEXT_PUBLIC_ROOT_URL || 'https://www.katori.dev';

// 保存済みの記事データを取得する関数
function getAllPosts() {
  const dataPath = path.join(process.cwd(), 'public', 'articles-data.json');
  const posts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!Array.isArray(posts)) {
    throw new Error('記事データが配列ではありません');
  }
  return posts;
}

// サイトマップXMLを生成する関数
function generateSiteMap(posts) {
  const paths = ['/', '/posts/', '/tags/', '/about/'];
  for (const post of posts) {
    paths.push(`/posts/${encodeURIComponent(post.slug)}/`);
  }
  const tags = new Set(posts.flatMap((post) => post.tags));
  for (const tag of tags) {
    paths.push(`/tags/${encodeURIComponent(tag)}/`);
  }

  const urls = paths.map((pathname) => {
    const url = new URL(pathname, baseUrl).href.replace(/&/g, '&amp;');
    return `  <url><loc>${url}</loc></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
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
