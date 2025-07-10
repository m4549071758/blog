import { Home } from '@/components/pages/home';
import { getAllPosts } from '@/lib/api';

type Props = React.ComponentPropsWithoutRef<typeof Home>;

const View: React.VFC<Props> = (props: Props) => <Home {...props} />;

export default View;

export const getStaticProps = async () => {
  // awaitを使用して非同期処理の結果を待つ
  const posts = await getAllPosts([
    'id',
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
    'like_count',
  ]);

  // 最初の4件のみを取得
  const limitedPosts = posts.slice(0, 4);

  return {
    props: { posts: limitedPosts },
    // データ再検証のために再生成するまでの秒数（いいね数の更新のため短い間隔に設定）
    revalidate: 30, // 30秒ごとに再検証
  };
};
