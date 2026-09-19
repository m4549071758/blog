'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import markdownStyles from './styles/markdown-styles.module.css';

// ライトボックス・ダイアグラム描画をクライアントサイドのみで読み込む
const ImageLightbox = dynamic(() => import('./ImageLightbox'), { ssr: false });
const DiagramRenderer = dynamic(() => import('./DiagramRenderer'), {
  ssr: false,
});

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
      {mounted && (
        <DiagramRenderer containerRef={containerRef} content={content} />
      )}
      {mounted && (
        <ImageLightbox containerRef={containerRef} content={content} />
      )}
    </div>
  );
};
