import { ROOT_URL } from '@/config/app';

// next/imageのカスタムローダー。静的エクスポートでは画像最適化サーバーが使えないため、
// 自サイトのCMS画像API(/api/images/*)にだけ幅を渡して縮小版を取得させる。
// それ以外(外部URL・public配下・blob/data URL)は元のURLをそのまま使う。
export const resizableImageUrl = (src: string, width: number) =>
  (src.startsWith('/api/images/') || src.startsWith(`${ROOT_URL}/api/images/`)) && !src.includes('?')
    ? `${src}?w=${width}`
    : null;

export default function imageLoader({ src, width }: { src: string; width: number }) {
  return resizableImageUrl(src, width) ?? src;
}
