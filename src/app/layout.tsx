import type { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '@/components/features/app/Footer';
import { Header } from '@/components/features/app/Header';
import { ContentLayout } from '@/components/features/app/Layout';
import '@/styles/index.css';
import '@/styles/prism.css';
import '@/styles/rlc.css';
import { ROOT_URL, SITE_NAME } from '@/config/app';

export const metadata: Metadata = {
  metadataBase: new URL(ROOT_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Katori's Tech blog - プログラミング、技術、ライフスタイルについての記事を投稿しています",
  openGraph: {
    title: SITE_NAME,
    description: "Katori's Tech blog - プログラミング、技術、ライフスタイルについての記事を投稿しています",
    url: ROOT_URL,
    siteName: SITE_NAME,
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/assets/author.webp',
        width: 512,
        height: 512,
        alt: `${SITE_NAME} ロゴ`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@katori_m', // Seo.tsxの@your_twitter_handleを仮修正
    creator: '@katori_m',
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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        </div>

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-WQCKJKLMCD"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-WQCKJKLMCD', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

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
