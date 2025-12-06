import type { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '@/components/features/app/Footer';
import { Header } from '@/components/features/app/Header';
import { ContentLayout } from '@/components/features/app/Layout';
import { Seo } from '@/components/features/app/Seo';
import '@/styles/index.css';
import '@/styles/prism.css';
import '@/styles/rlc.css';

export const metadata: Metadata = {
  title: 'Katori Blog',
  description: 'かとりのブログ - 技術、プログラミング、サーバー管理についての記事',
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
        <Seo />
        
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
