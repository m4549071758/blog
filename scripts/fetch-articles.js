const fs = require('fs');
const path = require('path');

// APIのベースURL
const API_BASE_URL = 'https://www.katori.dev';

// APIから記事データを取得してJSONファイルに保存
async function fetchAndSaveArticles() {
  try {
    console.log(`📡 APIから記事一覧を取得中: ${API_BASE_URL}/api/articles`);

    const response = await fetch(`${API_BASE_URL}/api/articles`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const articles = await response.json();

    if (!Array.isArray(articles)) {
      throw new Error('Invalid API response: expected array');
    }
    console.log(`📡 ${articles.length}件の記事を取得しました`);

    // 記事の詳細情報を並列取得（最大5件同時）
    const batchSize = 5;
    const detailedPosts = [];

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      console.log(
        `📄 記事詳細を取得中: ${i + 1}-${Math.min(
          i + batchSize,
          articles.length,
        )}/${articles.length}`,
      );

      const batchPromises = batch.map(async (article) => {
        try {
          const detailResponse = await fetch(
            `${API_BASE_URL}/api/articles/${article.article_id}`,
          );

          if (detailResponse.ok) {
            const detail = await detailResponse.json();
            return {
              slug: detail.id,
              date: detail.datetime,
              title: detail.title,
              excerpt: detail.excerpt || '',
              tags: detail.tags || [],
              coverImage: detail.cover_image || '',
              ogImage: detail.og_image || '',
            };
          } else {
            // 詳細取得に失敗した場合は基本情報のみ使用
            console.warn(`⚠️  記事詳細取得失敗: ${article.article_id}`);
            return {
              slug: article.article_id,
              date: new Date().toISOString(),
              title: article.title,
              excerpt: article.excerpt || '',
              tags: [],
              coverImage: '',
              ogImage: '',
            };
          }
        } catch (error) {
          console.error(
            `❌ 記事詳細取得エラー (${article.article_id}):`,
            error,
          );
          return {
            slug: article.article_id,
            date: new Date().toISOString(),
            title: article.title,
            excerpt: article.excerpt || '',
            tags: [],
            coverImage: '',
            ogImage: '',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      detailedPosts.push(...batchResults);
    }

    // 記事データを日付順でソート
    const sortedPosts = detailedPosts.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    // publicディレクトリにデータを保存
    const outputPath = path.join(process.cwd(), 'public', 'articles-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(sortedPosts, null, 2));

    console.log(`✅ 記事データを保存しました: ${outputPath}`);
    console.log(`📊 記事数: ${sortedPosts.length}`);

    return sortedPosts;
  } catch (error) {
    console.error('❌ API記事取得エラー:', error);

    // フォールバック: 既存のファイルがあればそれを使用
    const fallbackPath = path.join(
      process.cwd(),
      'public',
      'articles-data.json',
    );
    if (fs.existsSync(fallbackPath)) {
      console.log('📁 既存の記事データを使用します');
      const data = fs.readFileSync(fallbackPath, 'utf8');
      return JSON.parse(data);
    }

    // 最終フォールバック: _postsディレクトリから取得
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

// メイン処理
async function main() {
  try {
    console.log('💾 記事データを取得・保存中...');
    await fetchAndSaveArticles();
  } catch (error) {
    console.error('❌ 記事データ取得中にエラーが発生しました:', error);
    process.exit(1);
  }
}

main();
