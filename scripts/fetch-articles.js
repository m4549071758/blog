const fs = require('fs');
const path = require('path');

// APIのベースURL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.katori.dev';

// APIから記事データを取得してJSONファイルに保存
async function fetchAndSaveArticles() {
  const response = await fetch(`${API_BASE_URL}/api/articles`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`記事一覧の取得に失敗しました: HTTP ${response.status}`);
  }
  const articles = await response.json();
  if (
    !Array.isArray(articles) ||
    !articles.every(
      (article) =>
        article &&
        typeof article.article_id === 'string' &&
        article.article_id.length > 0,
    )
  ) {
    throw new Error('記事一覧APIが不正なデータを返しました');
  }

  const detailedPosts = [];
  for (let i = 0; i < articles.length; i += 5) {
    const batch = await Promise.all(
      articles.slice(i, i + 5).map(async (article) => {
        const detailResponse = await fetch(
          `${API_BASE_URL}/api/articles/${encodeURIComponent(article.article_id)}`,
          { signal: AbortSignal.timeout(30_000) },
        );
        if (!detailResponse.ok) {
          throw new Error(
            `記事の取得に失敗しました (${article.article_id}): HTTP ${detailResponse.status}`,
          );
        }
        const detail = await detailResponse.json();
        if (
          !detail ||
          detail.id !== article.article_id ||
          ![
            'title',
            'content',
            'excerpt',
            'cover_image',
            'og_image',
            'datetime',
          ].every((field) => typeof detail[field] === 'string') ||
          !['seo_title', 'seo_description'].every(
            (field) =>
              typeof detail[field] === 'undefined' ||
              typeof detail[field] === 'string',
          ) ||
          !detail.title ||
          !Number.isFinite(Date.parse(detail.datetime)) ||
          !Array.isArray(detail.tags) ||
          !detail.tags.every((tag) => typeof tag === 'string')
        ) {
          throw new Error(
            `記事APIの必須フィールドが不正です (${article.article_id})`,
          );
        }
        return {
          slug: detail.id,
          date: detail.datetime,
          title: detail.title,
          excerpt: detail.excerpt,
          seoTitle: detail.seo_title || '',
          seoDescription: detail.seo_description || '',
          tags: detail.tags,
          coverImage: detail.cover_image,
          ogImage: detail.og_image,
        };
      }),
    );
    detailedPosts.push(...batch);
  }

  detailedPosts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const outputPath = path.join(process.cwd(), 'public', 'articles-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(detailedPosts, null, 2));
  console.log(`${detailedPosts.length}件の記事データを保存しました`);
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
