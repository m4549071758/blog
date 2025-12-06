'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import markdownStyles from './styles/markdown-styles.module.css';

// ライトボックスをクライアントサイドのみで読み込む
const ImageLightbox = dynamic(
  () => import('@/hooks/useImageLightbox').then(mod => ({ 
    default: ({ containerRef, content }: any) => {
      const LightboxComponent = mod.useImageLightbox(containerRef, content);
      return LightboxComponent;
    }
  })),
  { ssr: false }
);

type Props = {
  content: string;
};

export const PostBody = ({ content }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="post">
      <div
        ref={containerRef}
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {mounted && <ImageLightbox containerRef={containerRef} content={content} />}
    </div>
  );
};
