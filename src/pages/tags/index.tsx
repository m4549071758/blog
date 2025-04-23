import { Tags } from '@/components/pages/tags';
import { getAllPosts } from '@/lib/api';

type Props = React.ComponentPropsWithoutRef<typeof Tags>;

const View: React.VFC<Props> = (props: Props) => <Tags {...props} />;

export default View;

export const getStaticProps = async () => {
  const posts = await getAllPosts(['tags']);

  let tags = posts.flatMap((post) => post.tags || []);

  // 重複を削除
  tags = Array.from(new Set(tags));

  return {
    props: { tags },
  };
};
