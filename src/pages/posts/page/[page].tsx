import { Page } from '@/components/pages/page';
import { getMaxPage, getPaginatedPosts } from '@/lib/api';

type Props = React.ComponentPropsWithoutRef<typeof Page>;

const View: React.VFC<Props> = (props: Props) => <Page {...props} />;

export default View;

type Params = {
  params: {
    page: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const page = parseInt(params.page);

  // awaitを使用して非同期関数を呼び出す
  const posts = await getPaginatedPosts(page, [
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
    'tags',
  ]);

  const maxPage = await getMaxPage();

  return {
    props: { posts, page, maxPage },
    revalidate: 60, // 1分ごとに再検証
  };
}
