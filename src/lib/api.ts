import { paginationOffset } from '@/config/pagination';
import { PostType } from '@/types/post';
import { getAuthToken } from './authenticationHandler';

// APIのベースURL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// キャッシュを保持する変数
let articlesListCache: any[] | null = null;
const articleDetailCache: Record<string, any> = {};

// 記事一覧をAPIから取得する関数
async function fetchArticlesList() {
  if (articlesListCache) return articlesListCache;

  try {
    console.log('Fetching articles from:', `${API_BASE_URL}/api/articles`);
    const response = await fetch(`${API_BASE_URL}/api/articles`, { cache: 'force-cache' });

    console.log('Response status:', response.status);

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.error('Received non-JSON response:', contentType);
      // ビルドを止めないために空配列を返す
      return [];
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
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
    console.log('Fetching article detail for ID:', articleId);
    const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
      cache: 'force-cache',
    });

    // 404エラーの場合は特別に処理
    if (response.status === 404) {
      console.warn(`Article not found: ${articleId}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.warn(`Invalid content-type for article ${articleId}: ${contentType}`);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Article detail API response error:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // レスポンスが空または無効なデータの場合
    if (!data || typeof data !== 'object') {
      console.warn(`Invalid data received for article ID ${articleId}`);
      return null;
    }

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
  if (!articles || !Array.isArray(articles)) {
    return [];
  }
  return articles.map((article: { article_id: string }) => article.article_id);
};

// 最大ページ数を計算
export const getMaxPage = async () => {
  const articles = await fetchArticlesList();
  if (!articles || !Array.isArray(articles)) {
    return 0;
  }
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
    id: 'id',
    slug: 'id',
    content: 'content',
    title: 'title',
    excerpt: 'excerpt',
    coverImage: 'cover_image',
    ogImage: 'og_image',
    tags: 'tags',
    date: 'datetime',
    like_count: 'like_count',
  };

  // 必須フィールドが欠けていないか確認
  const hasRequiredFields = ['title', 'content'].every(
    (field) =>
      typeof articleDetail[fieldMapping[field] || field] !== 'undefined',
  );

  if (!hasRequiredFields) {
    console.warn(`Article ${slug} is missing required fields`);
    return {}; // 必須フィールドがない場合は空オブジェクトを返す
  }

  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = slug;
    } else {
      const apiField = fieldMapping[field] || field;
      if (typeof articleDetail[apiField] !== 'undefined') {
        // coverImageとogImageは特別扱い - URLをそのまま使用
        if (field === 'coverImage') {
          items[field] = articleDetail[apiField]; // URLをそのまま使用
        } else if (field === 'ogImage') {
          // ogImageは { url: string } の形式に変換
          items[field] = { url: articleDetail[apiField] };
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

// 更新
// ブログ記事のAPIクライアント関数

type Post = {
  id?: string;
  title: string;
  content: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};

// 記事IDから記事データを取得
export async function getPostById(id: string): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);

  if (!response.ok) {
    throw new Error('記事の取得に失敗しました');
  }

  return response.json();
}

// 記事を新規作成
export async function createPost(postData: Post): Promise<Post> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/articles/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error('記事の作成に失敗しました');
  }

  return response.json();
}

// 記事を更新
export async function updatePost(id: string, postData: Post): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error('記事の更新に失敗しました');
  }

  return response.json();
}
