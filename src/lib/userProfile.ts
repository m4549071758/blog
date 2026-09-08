import { cache } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  github_url: string;
  twitter_url: string;
  qiita_url: string;
  misskey_url: string;
}

// ID指定またはデフォルトユーザー（管理者）を取得することを想定
// 今回はブログのオーナー(=最初のユーザー)を取得する関数として定義
export const getOwnerProfile = cache(async (): Promise<UserProfile | null> => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://www.katori.dev/api';
  const res = await fetch(`${apiUrl}/owner`, {
    cache: 'force-cache',
    credentials: 'include',
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`プロフィールAPIの取得に失敗しました: HTTP ${res.status}`);
  }
  return res.json();
});
