export const StorySkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden w-full h-full vstack md:flex-row">
      {/* カバー画像のスケルトン */}
      <div className="center w-full md:w-1/3 h-52 md:h-full bg-neutral-50 md:bg-transparent">
        <div className="w-full max-w-xs h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* コンテンツのスケルトン */}
      <div className="md:w-2/3 p-4 md:p-6 vstack gap-2 bg-primary-1">
        <div className="flex justify-between items-start">
          {/* 日付のスケルトン */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          {/* いいね数のスケルトン */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>

        {/* タイトルのスケルトン */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>

        {/* 抜粋のスケルトン */}
        <div className="space-y-2 mt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};
