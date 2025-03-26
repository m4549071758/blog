import { paginationOffset } from '@/config/pagination';
import { PostType } from '@/types/post';

// APIのベースURL
const API_BASE_URL = 'http://localhost:8080';

// キャッシュを保持する変数
let articlesListCache: any[] | null = null;
const articleDetailCache: Record<string, any> = {};

// 記事一覧をAPIから取得する関数
async function fetchArticlesList() {
  if (articlesListCache) return articlesListCache;

  try {
    const response = await fetch(`${API_BASE_URL}/api/articles`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    articlesListCache = data;
    return data;
  } catch (error) {
    console.error('Error fetching articles list:', error);
    return [];
  }
}

// 個別記事の詳細を取得する関数
async function fetchArticleDetail(articleId: string) {
  if (articleDetailCache[articleId]) return articleDetailCache[articleId];

  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    articleDetailCache[articleId] = data;
    return data;
  } catch (error) {
    console.error(`Error fetching article detail for ID ${articleId}:`, error);
    return null;
  }
}

// 記事のスラグ(ID)一覧を取得
export const getPostSlugs = async () => {
  const articles = await fetchArticlesList();
  return articles.map((article: { article_id: string }) => article.article_id);
};

// 最大ページ数を計算
export const getMaxPage = async () => {
  const articles = await fetchArticlesList();
  return Math.ceil(articles.length / paginationOffset);
};

// 特定のスラグ(ID)の記事を取得
export const getPostBySlug = async (slug: string, fields: string[] = []) => {
  if (!slug) {
    console.error('Slug is undefined');
    return {};
  }

  // 記事の詳細情報を取得
  const articleDetail = await fetchArticleDetail(slug);

  if (!articleDetail) {
    console.warn(`No article found for slug: ${slug}`);
    return {};
  }

  type Items = {
    [key: string]: any;
  };

  const items: Items = {};

  // フィールドマッピング（JSONキーとPostTypeのキーが異なる場合）
  const fieldMapping: Record<string, string> = {
    slug: 'id',
    content: 'content',
    title: 'title',
    excerpt: 'excerpt',
    coverImage: 'cover_image',
    ogImage: 'og_image',
    tags: 'tags',
    date: 'datetime',
  };

  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = slug;
    } else {
      const apiField = fieldMapping[field] || field;
      if (typeof articleDetail[apiField] !== 'undefined') {
        // coverImageとogImageは特別扱い - URLをそのまま使用
        if (field === 'coverImage' || field === 'ogImage') {
          items[field] = articleDetail[apiField]; // URLをそのまま使用
        } else {
          items[field] = articleDetail[apiField];
        }
      }
    }
  });

  return items as Partial<PostType>;
};

type Field = keyof PostType;

// すべての記事を取得
export const getAllPosts = async (fields: Field[] = []) => {
  try {
    const slugs = await getPostSlugs();

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return [];
    }

    const postsPromises = slugs.map((slug) =>
      getPostBySlug(slug, fields as string[]),
    );

    const posts = await Promise.all(postsPromises);

    // 空のオブジェクトをフィルタリング
    const validPosts = posts.filter(
      (post) => post && Object.keys(post).length > 0,
    );

    return validPosts.sort((post1, post2) => {
      if (!post1.date || !post2.date) return 0;
      return post1.date > post2.date ? -1 : 1;
    });
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    return [];
  }
};

// ページネーション用に特定範囲の記事を取得
export const getPaginatedPosts = async (page: number, fields: Field[] = []) => {
  const allPosts = await getAllPosts(fields);
  const start = (page - 1) * paginationOffset;
  const end = start + paginationOffset;

  return allPosts.slice(start, end);
};

// ホームページ用に最新の数件を取得
export const getRecentPosts = async (count: number, fields: Field[] = []) => {
  const allPosts = await getAllPosts(fields);
  return allPosts.slice(0, count);
};
