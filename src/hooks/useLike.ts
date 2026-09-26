import { useState, useEffect, useCallback } from 'react';
import { apiUrl, fetchJson, getVisitorId } from '@/lib/fingerprint';

interface LikeState {
  likeCount: number;
  isLiked: boolean;
  isLoading: boolean;
}

interface LikeResponse {
  article_id: string;
  like_count: number;
  is_liked: boolean;
  message: string;
}

const fetchLikeStatus = (articleId: string, fingerprint: string) =>
  fetchJson<LikeResponse>(
    `${apiUrl(`/api/like-status/${articleId}`)}?fingerprint=${encodeURIComponent(fingerprint)}`,
  );

/**
 * 一覧表示用。いいね数だけを取得し、FingerprintJSは読み込まない。
 */
export const useLikeCount = (articleId: string, initialLikeCount: number) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  useEffect(() => {
    if (!articleId || articleId.trim() === '') return;

    let cancelled = false;
    fetchLikeStatus(articleId, 'anonymous')
      .then((data) => {
        if (!cancelled) setLikeCount(data.like_count);
      })
      .catch((error) => console.error('Failed to fetch like status:', error));

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  return likeCount;
};

export const useLike = (articleId: string) => {
  const [likeState, setLikeState] = useState<LikeState>({
    likeCount: 0,
    isLiked: false,
    isLoading: true,
  });
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    getVisitorId()
      .then(setFingerprint)
      .catch((error) => {
        console.error('Failed to get fingerprint:', error);
        // フィンガープリントの取得に失敗した場合でも、いいね数は表示する
        setLikeState((prev) => ({ ...prev, isLoading: false }));
      });
  }, []);

  // いいね状態の取得
  useEffect(() => {
    if (!articleId || articleId.trim() === '') {
      setLikeState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    let cancelled = false;
    // fingerprintが取得できていない場合でも、いいね数は取得する
    fetchLikeStatus(articleId, fingerprint || 'anonymous')
      .then((data) => {
        if (cancelled) return;
        setLikeState({
          likeCount: data.like_count,
          isLiked: fingerprint ? data.is_liked : false,
          isLoading: false,
        });
      })
      .catch((error) => {
        console.error('Failed to fetch like status:', error);
        if (!cancelled) setLikeState((prev) => ({ ...prev, isLoading: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, fingerprint]);

  // いいねのトグル
  const toggleLike = useCallback(async () => {
    if (
      !fingerprint ||
      likeState.isLoading ||
      !articleId ||
      articleId.trim() === ''
    )
      return;

    try {
      setLikeState((prev) => ({ ...prev, isLoading: true }));

      const data = await fetchJson<LikeResponse>(apiUrl('/api/articles/like'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId, fingerprint }),
      });

      setLikeState({
        likeCount: data.like_count,
        isLiked: data.is_liked,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setLikeState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [articleId, fingerprint, likeState.isLoading]);

  return {
    likeCount: likeState.likeCount,
    isLiked: likeState.isLiked,
    isLoading: likeState.isLoading,
    toggleLike,
  };
};
