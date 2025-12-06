import { Date } from '@/components/common/Date';
import { Image } from '@/components/common/Image';
import { Link } from '@/components/common/Link';
import { LikeDisplay } from './LikeDisplay';

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  slug: string;
  likeCount?: number;
  id?: string;
};

export const Story = ({ title, coverImage, date, excerpt, slug, likeCount, id }: Props) => {
  return (
    <Link 
      href={`/posts/${slug}`}
      className="select-none overflow-hidden w-full h-full vstack md:flex-row cursor-pointer focus:outline-2"
    >
      <div className="center w-full md:w-1/3 h-52 md:h-full bg-neutral-50 md:bg-transparent">
        <Image
          src={coverImage}
          alt={`Cover Image for ${title}`}
          className="w-full max-w-xs h-64 object-cover"
        />
      </div>
      <div className="md:w-2/3 p-4 md:p-6 vstack gap-2 bg-primary-1">
        <div className="flex justify-between items-start">
          <Date date={date} />
          <LikeDisplay 
            articleId={id} 
            initialLikeCount={likeCount || 0}
          />
        </div>
        <h3 className="text-primary-1 text-xl font-medium">{title}</h3>
        <p className="text-neutral-700 dark:text-neutral-300 font-normal text-md line-clamp-2 md:line-clamp-3">
          {excerpt}
        </p>
      </div>
    </Link>
  );
};
