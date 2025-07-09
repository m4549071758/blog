import { AiTwotoneTags } from 'react-icons/ai';
import { Date } from '@/components/common/Date';
import { Image } from '@/components/common/Image';
import { LikeButton } from '@/components/common/LikeButton';
import { Link } from '@/components/common/Link';

type Props = {
  title: string;
  coverImage: string;
  date: string;
  tags: string[];
  articleId?: string;
};

export const PostHeader = ({
  title,
  coverImage,
  date,
  tags,
  articleId,
}: Props) => {
  return (
    <div className="vstack gap-4">
      <div className="w-full h-64 sm:h-80">
        <Image
          src={coverImage}
          alt={`Cover Image for ${title}`}
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-primary-1 text-3xl md:text-4xl font-bold tracking-tighter leading-tight">
        {title}
      </h1>
      <div className="vstack gap-4">
        <Date date={date} />
        {articleId && (
          <div className="flex justify-center">
            <LikeButton articleId={articleId} />
          </div>
        )}
        <div className="wrap gap-2">
          <span className="select-none text-primary-1">
            <AiTwotoneTags />
          </span>
          {tags.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`} passHref>
              <a className="badge">{tag}</a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
