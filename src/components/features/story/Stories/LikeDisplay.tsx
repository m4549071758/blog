import React from 'react';
import { AiOutlineHeart } from 'react-icons/ai';
import { useLike } from '@/hooks/useLike';

type Props = {
  articleId: string | undefined;
  initialLikeCount?: number;
  className?: string;
};

export const LikeDisplay: React.FC<Props> = ({ 
  articleId, 
  initialLikeCount = 0,
  className = '' 
}) => {
  const { likeCount, isLoading } = useLike(articleId || '');

  // articleIdが存在しない場合は表示しない
  if (!articleId) {
    return null;
  }

  // ローディング中は初期値またはスケルトンを表示
  const displayCount = isLoading ? initialLikeCount : likeCount;

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-500 ${className}`}>
      <AiOutlineHeart className="w-4 h-4" />
      <span className={isLoading ? 'opacity-60' : ''}>
        {displayCount}
      </span>
    </div>
  );
};
