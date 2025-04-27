import { useRouter } from 'next/router';
import { Posts } from '@/components/pages/posts';
import { getPostBySlug, getAllPosts } from '@/lib/api';
import markdownToHtml from '@/lib/markdownToHtml';

type Props = React.ComponentPropsWithoutRef<typeof Posts>;

const View = (props: Props) => {
  const router = useRouter();

  // fallbackの表示（ページがまだ生成されていない場合）
  if (router.isFallback) {
    return (
      <div className="container mx-auto px-5 py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-2xl font-bold mb-4">読み込み中...</h1>
          <p>記事データを取得しています。しばらくお待ちください。</p>
        </div>
      </div>
    );
  }

  // 記事データが存在しない場合（404エラー）
  if (!props.post || !props.post.title) {
    return (
      <div className="container mx-auto px-5 py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-2xl font-bold mb-4">記事が見つかりません</h1>
          <p>お探しの記事は存在しないか、削除された可能性があります。</p>
        </div>
      </div>
    );
  }

  return <Posts {...props} />;
};

export default View;

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  try {
    // awaitを使用してgetPostBySlugの結果を待つ
    const post = await getPostBySlug(params.slug, [
      'title',
      'date',
      'slug',
      'author',
      'content',
      'ogImage',
      'coverImage',
      'excerpt',
      'tags',
    ]);

    // 記事が見つからない場合は404を返す
    if (!post || Object.keys(post).length === 0 || !post.title) {
      return {
        notFound: true,
      };
    }

    const content = await markdownToHtml(post.content || '');

    return {
      props: {
        post: {
          ...post,
          content,
        },
      },
      // キャッシュの有効期限を短くして、定期的にデータを更新
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);

    // エラーが発生した場合は404ページを表示
    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  try {
    // awaitを使用してgetAllPostsの結果を待つ
    const posts = await getAllPosts(['slug']);

    // 有効なスラグを持つ投稿のみをフィルタリング
    const validPosts = posts.filter((post) => post.slug);

    return {
      paths: validPosts.map((post) => ({
        params: {
          slug: post.slug,
        },
      })),
      // 未生成のパスに対しては生成を試みる
      fallback: true,
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: true,
    };
  }
}
