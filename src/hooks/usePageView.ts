import { useState, useEffect } from 'react';
import { apiUrl, fetchJson, getVisitorId } from '@/lib/fingerprint';

interface PageViewResponse {
  article_id: string;
  view_count: number;
  message: string;
}

export const usePageView = (articleId: string) => {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!articleId || articleId.trim() === '') {
      setIsLoading(false);
      return;
    }

    const recordAndFetch = async () => {
      try {
        const fingerprint = await getVisitorId();
        const data = await fetchJson<PageViewResponse>(
          apiUrl('/api/articles/pageview'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ article_id: articleId, fingerprint }),
          },
        );

        setViewCount(data.view_count);
      } catch (error) {
        // PV取得失敗はサイレントに処理（カウンター表示は諦める）
        console.error('Failed to record page view:', error);
      } finally {
        setIsLoading(false);
      }
    };

    recordAndFetch();
  }, [articleId]);

  return { viewCount, isLoading };
};
