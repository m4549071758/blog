import React from 'react';
import { useRootPath } from '@/hooks/useRootPath';

export const Image = React.forwardRef<
  React.ElementRef<'img'>,
  React.ComponentPropsWithoutRef<'img'>
>(({ children, src, alt, ...props }, forwardedRef) => {
  const rootPath = useRootPath();

  // 完全なURLをチェック
  const imgPath =
    src && (src.startsWith('http://') || src.startsWith('https://'))
      ? src // 完全なURLはそのまま使用
      : rootPath + src; // 相対パスの場合はrootPathと結合

  return (
    <img src={imgPath} alt={alt} {...props} ref={forwardedRef}>
      {children}
    </img>
  );
});

Image.displayName = 'Image';
