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
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.katori.dev/api';
    const res = await fetch(`${apiUrl}/site-config`, {
      next: { revalidate: 60 }, // 1分キャッシュ (またはビルド時のみなら force-cache だが、再構築トリガーあるので revalidate で良し)
    });
    
    if (!res.ok) {
        console.warn('Failed to fetch site config, using defaults');
        return null;
    }
    
    return res.json();
  } catch (error) {
    console.warn('Error fetching site config:', error);
    return null;
  }
});
