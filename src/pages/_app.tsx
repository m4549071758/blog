import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '@/styles/index.css';
import Script from 'next/script';
import { Footer } from '@/components/features/app/Footer';
import { Header } from '@/components/features/app/Header';
import { ContentLayout } from '@/components/features/app/Layout';
import { Seo } from '@/components/features/app/Seo';
import * as gtag from '@/lib/gtag';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    const handleRouterChange = (url: any) => {
      console.log('url', url);
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouterChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouterChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-WQCKJKLMCD`}
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

      <Seo />

      <div
        style={{ gridTemplateRows: 'auto 1fr auto' }}
        className="grid gap-10 min-h-screen bg-global"
      >
        <Header />
        <ContentLayout className="px-0 py-6 sm:p-6">
          <Component {...pageProps} />
        </ContentLayout>
        <Footer />
      </div>
    </>
  );
}
