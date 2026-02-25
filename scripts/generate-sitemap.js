const fs = require('fs');
const path = require('path');

// 本番ドメインをハードコード
// 本番ドメイン
const baseUrl = process.env.NEXT_PUBLIC_ROOT_URL || 'https://www.katori.dev';

// 保存済みの記事データを取得する関数
function getAllPosts() {
  try {
    // まずpublicディレクトリの保存済みデータを試す
    const dataPath = path.join(process.cwd(), 'public', 'articles-data.json');

    if (fs.existsSync(dataPath)) {
      console.log('📁 保存済みの記事データを読み込み中...');
      const data = fs.readFileSync(dataPath, 'utf8');
      const posts = JSON.parse(data);
      console.log(`✅ ${posts.length}件の記事データを読み込みました`);
      return posts;
    }

    // フォールバック: _postsディレクトリから取得
    console.log('📁 フォールバック: _postsディレクトリから記事を取得中...');
    return getPostsFromFiles();
  } catch (error) {
    console.error('❌ 記事データ読み込みエラー:', error);
    return getPostsFromFiles();
  }
}

// フォールバック: ファイルシステムから記事を取得
function getPostsFromFiles() {
  try {
    const matter = require('gray-matter');
    const postsDirectory = path.join(process.cwd(), '_posts');

    if (!fs.existsSync(postsDirectory)) {
      console.warn('⚠️  _postsディレクトリが見つかりません');
      return [];
    }

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
          excerpt: data.excerpt || '',
          tags: data.tags || [],
        };
      })
      .filter((post) => post.slug && post.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`📁 ローカルファイルから${posts.length}件の記事を取得しました`);
    return posts;
  } catch (error) {
    console.error('❌ ローカルファイル取得エラー:', error);
    return [];
  }
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
