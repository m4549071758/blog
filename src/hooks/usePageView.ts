import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';

interface PageViewResponse {
  article_id: string;
  view_count: number;
  message: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprint = result.visitorId;

        const baseUrl = API_BASE_URL.replace(/\/$/, '');
        const response = await axios.post<PageViewResponse>(
          `${baseUrl}/api/articles/pageview`,
          { article_id: articleId, fingerprint },
          { headers: { 'Content-Type': 'application/json' } },
        );

        setViewCount(response.data.view_count);
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
