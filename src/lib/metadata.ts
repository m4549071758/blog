import type { Metadata } from 'next';
import { ROOT_URL } from '@/config/app';
import { getSiteConfig } from '@/lib/siteConfig';

export async function createPageMetadata(
  title: string,
  description: string,
  pathname: string,
): Promise<Metadata> {
  const config = await getSiteConfig();
  const url = new URL(pathname, ROOT_URL).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      locale: 'ja_JP',
      siteName: config?.site_title,
      images: [
        {
          url: config?.ogp_image_url || '/assets/author.webp',
          width: 512,
          height: 512,
          alt: `${config?.site_title || 'Blog'} Logo`,
        },
      ],
    },
  };
}
