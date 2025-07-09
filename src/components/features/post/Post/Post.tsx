import { LikeButton } from '@/components/common/LikeButton';
import { PostType } from '@/types/post';
import { PostBody } from './PostBody';
import { PostHeader } from './PostHeader';

type Props = {
  post: PostType;
};

export const Post: React.VFC<Props> = ({ post }) => {
  const { id, title, coverImage, date, tags, content } = post;

  return (
    <div className="p-8 bg-primary-1">
      <PostHeader
        title={title}
        coverImage={coverImage}
        date={date}
        tags={tags}
      />
      <PostBody content={content} />
      {id && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-center">
            <LikeButton articleId={id} />
          </div>
        </div>
      )}
    </div>
  );
};
