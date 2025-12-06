'use client';

import { useEffect, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export const useImageLightbox = (
  containerRef: React.RefObject<HTMLElement>,
  content?: string
) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');

  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll('img');
    
    const handleImageClick = (e: Event) => {
      const img = e.currentTarget as HTMLImageElement;
      setCurrentImage(img.src);
      setLightboxOpen(true);
    };

    images.forEach((img) => {
      // カーソルをポインターに変更
      img.style.cursor = 'pointer';
      // ホバー時の視覚フィードバック
      img.classList.add('hover:opacity-90', 'transition-opacity');
      // クリックイベントを追加
      img.addEventListener('click', handleImageClick);
    });

    // クリーンアップ
    return () => {
      images.forEach((img) => {
        img.removeEventListener('click', handleImageClick);
      });
    };
  }, [containerRef, content]);

  const LightboxComponent = lightboxOpen ? (
    <Lightbox
      open={lightboxOpen}
      close={() => setLightboxOpen(false)}
      slides={[{ src: currentImage }]}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
    />
  ) : null;

  return LightboxComponent;
};
