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

export async function getStaticPaths() {
  const maxPage = await getMaxPage();

  const paths = [];
  for (let page = 1; page <= maxPage; page++) {
    paths.push({
      params: { page: page.toString() },
    });
  }

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }: Params) {
  const page = parseInt(params.page);

  // awaitを使用して非同期関数を呼び出す
  const posts = await getPaginatedPosts(page, [
    'id',
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
    'tags',
    'like_count',
  ]);

  const maxPage = await getMaxPage();

  return {
    props: { posts, page, maxPage },
    revalidate: 60, // 1分ごとに再検証
  };
}
