import { cache } from 'react';

export interface SiteConfig {
  site_title: string;
  site_description: string;
  google_analytics_id: string;
  ogp_image_url: string;
  twitter_card_type: string;
  twitter_site: string;
  robot_index: boolean;
  publisher_type: string;
  publisher_logo_url: string;
  publisher_description: string;
  social_links: string; // JSON string
}

// ビルド時に一度だけ取得してキャッシュする
export const getSiteConfig = cache(async (): Promise<SiteConfig | null> => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://www.katori.dev/api';
  const res = await fetch(`${apiUrl}/site-config`, {
    cache: 'force-cache',
    credentials: 'include',
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`サイト設定APIの取得に失敗しました: HTTP ${res.status}`);
  }
  return res.json();
});
