import type { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '@/components/features/app/Footer';
import { Header } from '@/components/features/app/Header';
import { ContentLayout } from '@/components/features/app/Layout';
import '@/styles/index.css';
import '@/styles/prism.css';
import '@/styles/rlc.css';
import { ROOT_URL } from '@/config/app';
import { getSiteConfig } from '@/lib/siteConfig';
import { WebsiteStructuredData } from '@/components/common/StructuredData';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteName = config?.site_title || 'Tech Blog';
  const description = config?.site_description || 'Tech blog about programming and lifestyle.';
  
  return {
    metadataBase: new URL(ROOT_URL),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: description,
    openGraph: {
      title: siteName,
      description: description,
      url: ROOT_URL,
      siteName: siteName,
      locale: 'ja_JP',
      type: 'website',
      images: [
        {
          url: config?.ogp_image_url || '/assets/author.webp',
          width: 512,
          height: 512,
          alt: `${siteName} Logo`,
        },
      ],
    },
    twitter: {
      card: (config?.twitter_card_type as any) || 'summary_large_image',
      site: config?.twitter_site || '@katori_m',
      creator: config?.twitter_site || '@katori_m',
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: { url: '/favicons/apple-touch-icon.png', sizes: '180x180' },
      other: [
        { rel: 'mask-icon', url: '/favicons/safari-pinned-tab.svg', color: '#5bbad5' },
      ],
    },
    manifest: '/favicons/site.webmanifest',
    alternates: {
      types: {
        'application/rss+xml': '/feed.xml',
      },
    },
    robots: {
      index: config?.robot_index ?? true,
      follow: config?.robot_index ?? true,
      googleBot: {
        index: config?.robot_index ?? true,
        follow: config?.robot_index ?? true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();
  const gaId = config?.google_analytics_id;

  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css"
        />
      </head>
      <body>
        <div
          style={{ gridTemplateRows: 'auto 1fr auto' }}
          className="grid gap-10 min-h-screen bg-global"
        >
          <Header />
          <ContentLayout className="px-0 py-6 sm:p-6">
            {children}
          </ContentLayout>
          <Footer />
          <Footer />
        </div>

        {config && (
          <WebsiteStructuredData
            name={config.site_title || "Katori's blog"}
            url={ROOT_URL}
            description={config.site_description || ''}
          />
        )}

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Cloudflare Web Analytics */}
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "284dd6ae58764e1dbf8929a7aa798fd9"}'
        />
      </body>
    </html>
  );
}
