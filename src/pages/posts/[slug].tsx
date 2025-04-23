import { Posts } from '@/components/pages/posts';
import { getPostBySlug, getAllPosts } from '@/lib/api';
import markdownToHtml from '@/lib/markdownToHtml';

type Props = React.ComponentPropsWithoutRef<typeof Posts>;

const View: React.VFC<Props> = (props: Props) => <Posts {...props} />;

export default View;

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
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

  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
    revalidate: 60,
  };
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
      // 未生成のパスは生成を試みる
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}
