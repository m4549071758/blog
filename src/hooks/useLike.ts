import { useState, useEffect, useCallback } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useLike = (articleId: string) => {
  const [likeState, setLikeState] = useState<LikeState>({
    likeCount: 0,
    isLiked: false,
    isLoading: true,
  });
  const [fingerprint, setFingerprint] = useState<string>('');

  // FingerprintJSの初期化とフィンガープリント取得
  useEffect(() => {
    const getFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (error) {
        console.error('Failed to get fingerprint:', error);
      }
    };

    getFingerprint();
  }, []);

  // いいね状態の取得
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!fingerprint || !articleId) return;

      try {
        // 末尾のスラッシュを除去してからエンドポイントを構築
        const baseUrl = API_BASE_URL.replace(/\/$/, '');
        const response = await axios.get<LikeResponse>(
          `${baseUrl}/api/articles/${articleId}/like-status`,
          {
            params: { fingerprint },
          },
        );

        setLikeState({
          likeCount: response.data.like_count,
          isLiked: response.data.is_liked,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch like status:', error);
        setLikeState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchLikeStatus();
  }, [articleId, fingerprint]);

  // いいねのトグル
  const toggleLike = useCallback(async () => {
    if (!fingerprint || likeState.isLoading) return;

    try {
      setLikeState((prev) => ({ ...prev, isLoading: true }));

      // 末尾のスラッシュを除去してからエンドポイントを構築
      const baseUrl = API_BASE_URL.replace(/\/$/, '');
      const response = await axios.post<LikeResponse>(
        `${baseUrl}/api/articles/like`,
        {
          article_id: articleId,
          fingerprint,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      setLikeState({
        likeCount: response.data.like_count,
        isLiked: response.data.is_liked,
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
