import React from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { useRootPath } from '@/hooks/useRootPath';

type Props = Omit<NextImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt?: string;
};

export const Image = React.forwardRef<HTMLImageElement, Props>(
  ({ src, alt, ...props }, ref) => {
    const rootPath = useRootPath();

    if (!src) return null;

    // 完全なURLをチェック
    const imgPath =
      src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:') || src.startsWith('data:')
        ? src // 完全なURLはそのまま使用
        : rootPath + src; // 相対パスの場合はrootPathと結合

    return (
      <NextImage
        ref={ref}
        src={imgPath}
        alt={alt || ''}
        {...props}
      />
    );
  },
);

Image.displayName = 'Image';
