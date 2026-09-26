'use client';

import React from 'react';
import { AiOutlineHeart } from 'react-icons/ai';
import { useLikeCount } from '@/hooks/useLike';

type Props = {
  articleId: string | undefined;
  initialLikeCount?: number;
  className?: string;
};

export const LikeDisplay: React.FC<Props> = ({
  articleId,
  initialLikeCount = 0,
  className = '',
}) => {
  const likeCount = useLikeCount(articleId || '', initialLikeCount);

  // articleIdが存在しない場合は表示しない
  if (!articleId) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-500 ${className}`}>
      <AiOutlineHeart className="w-4 h-4" aria-hidden="true" />
      <span>{likeCount}</span>
    </div>
  );
};
