import { Tag } from '@/components/pages/tag';
import { getAllPosts } from '@/lib/api';

type Props = React.ComponentPropsWithoutRef<typeof Tag>;

const View: React.VFC<Props> = (props: Props) => <Tag {...props} />;

export default View;

type Params = {
  params: {
    tag: string;
  };
};

export const getStaticProps = async ({ params }: Params) => {
  // awaitを追加
  const allPosts = await getAllPosts([
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  const posts = allPosts.filter((post) => post.tags?.includes(params.tag));

  return {
    props: { posts, tag: params.tag }, // タグ名も渡す
  };
};

export async function getStaticPaths() {
  const posts = await getAllPosts(['tags']);
  const tags = posts.flatMap((post) => post.tags || []);
  const uniqueTags = Array.from(new Set(tags));

  return {
    paths: uniqueTags.map((tag) => ({
      params: { tag },
    })),
    fallback: false,
  };
}
