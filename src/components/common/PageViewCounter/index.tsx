import React from 'react';
import { LuEye } from 'react-icons/lu';
import { usePageView } from '@/hooks/usePageView';

interface PageViewCounterProps {
  articleId: string;
  className?: string;
}

export const PageViewCounter: React.FC<PageViewCounterProps> = ({
  articleId,
  className = '',
}) => {
  const { viewCount, isLoading } = usePageView(articleId);

  return (
    <span
      className={`flex items-center gap-1.5 text-sm text-gray-500 ${className}`}
      title="ページビュー数"
    >
      <LuEye className="w-4 h-4" />
      <span>{isLoading ? '...' : viewCount.toLocaleString()}</span>
    </span>
  );
};
