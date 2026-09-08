import { paginationOffset } from '@/config/pagination';
import { PostType } from '@/types/post';

// APIのベースURL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// キャッシュを保持する変数
let articlesListCache: { article_id: string }[] | null = null;
const articleDetailCache: Record<string, Record<string, unknown>> = {};

// 記事一覧をAPIから取得する関数
async function fetchArticlesList() {
  if (articlesListCache) return articlesListCache;

  const response = await fetch(`${API_BASE_URL}/api/articles`, {
    cache: 'force-cache',
    credentials: 'include',
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`記事一覧APIの取得に失敗しました: HTTP ${response.status}`);
  }
  const data: unknown = await response.json();
  if (
    !Array.isArray(data) ||
    !data.every(
      (article: unknown): article is { article_id: string } =>
        typeof article === 'object' &&
        article !== null &&
        'article_id' in article &&
        typeof article.article_id === 'string' &&
        article.article_id.length > 0,
    )
  ) {
    throw new Error('記事一覧APIが不正なデータを返しました');
  }
  articlesListCache = data;
  return articlesListCache;
}

// 個別記事の詳細を取得する関数
async function fetchArticleDetail(articleId: string) {
  if (articleDetailCache[articleId]) return articleDetailCache[articleId];

  const response = await fetch(
    `${API_BASE_URL}/api/articles/${encodeURIComponent(articleId)}`,
    {
      cache: 'force-cache',
      credentials: 'include',
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `記事APIの取得に失敗しました (${articleId}): HTTP ${response.status}`,
    );
  }
  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error(`記事APIが不正なデータを返しました (${articleId})`);
  }
  const article = data as Record<string, unknown>;
  const requiredStrings = [
    'id',
    'title',
    'content',
    'excerpt',
    'cover_image',
    'og_image',
    'datetime',
  ];
  const optionalStrings = ['seo_title', 'seo_description'];
  if (
    !requiredStrings.every((field) => typeof article[field] === 'string') ||
    !optionalStrings.every(
      (field) =>
        typeof article[field] === 'undefined' ||
        typeof article[field] === 'string',
    ) ||
    article.id !== articleId ||
    !article.title ||
    !Number.isFinite(Date.parse(article.datetime as string)) ||
    !Array.isArray(article.tags) ||
    !article.tags.every((tag: unknown) => typeof tag === 'string')
  ) {
    throw new Error(`記事APIの必須フィールドが不正です (${articleId})`);
  }
  articleDetailCache[articleId] = article;
  return article;
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
export const getPostBySlug = async (
  slug: string,
  fields: (keyof PostType)[] = [],
) => {
  if (!slug) {
    throw new Error('記事IDが指定されていません');
  }

  // 記事の詳細情報を取得
  const articleDetail = await fetchArticleDetail(slug);

  if (!articleDetail) {
    return {};
  }

  type Items = Record<string, unknown>;

  const items: Items = {};

  // フィールドマッピング（JSONキーとPostTypeのキーが異なる場合）
  const fieldMapping: Record<string, string> = {
    id: 'id',
    slug: 'id',
    content: 'content',
    title: 'title',
    excerpt: 'excerpt',
    seoTitle: 'seo_title',
    seoDescription: 'seo_description',
    coverImage: 'cover_image',
    ogImage: 'og_image',
    tags: 'tags',
    date: 'datetime',
    like_count: 'like_count',
  };

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
  const slugs = await getPostSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const post = await getPostBySlug(slug, fields);
      if (Object.keys(post).length === 0) {
        throw new Error(`一覧に含まれる記事を取得できませんでした (${slug})`);
      }
      return post;
    }),
  );

  return posts.sort((post1, post2) => {
    if (!post1.date || !post2.date) return 0;
    return Date.parse(post2.date) - Date.parse(post1.date);
  });
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
  slug?: string;
  cover_image: string;
  excerpt: string;
  seo_title?: string;
  seo_description?: string;
  primary_keyword?: string;
  og_image: string;
  tags: string[];
  datetime: string;
};

export async function getPostForEditor(id: string): Promise<Post> {
  const response = await fetch(
    `${API_BASE_URL}/api/articles/${encodeURIComponent(id)}/editor`,
    { credentials: 'include' },
  );

  if (!response.ok) {
    throw new Error('編集用の記事取得に失敗しました');
  }

  return response.json();
}

// 記事を新規作成
export async function createPost(postData: Post): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/api/articles/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '記事の作成に失敗しました');
  }

  return response.json();
}

// 記事を更新
export async function updatePost(id: string, postData: Post): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '記事の更新に失敗しました');
  }

  return response.json();
}
