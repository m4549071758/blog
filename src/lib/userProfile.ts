import { cache } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  github_url: string;
  twitter_url: string;
  qiita_url: string;
  zenn_url: string;
}

// ID指定またはデフォルトユーザー（管理者）を取得することを想定
// 今回はブログのオーナー(=最初のユーザー)を取得する関数として定義
export const getOwnerProfile = cache(async (): Promise<UserProfile | null> => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
             // ユーザーリストの先頭を取得する簡易実装 (本来は owner などのロールで絞るか、ID固定)
              next: { revalidate: 60 },
        });

        if (!res.ok) return null;
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
            return users[0];
        }
        return null;
    } catch (error) {
        console.warn('Error fetching owner profile:', error);
        return null;
    }
});
