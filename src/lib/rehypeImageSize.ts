import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { ROOT_URL } from '@/config/app';

type Size = { width: number; height: number };

// 先頭バイトだけで寸法が分かる形式をパースする。未対応形式はnullを返し、属性を付けない。
export const readImageSize = (buf: Uint8Array): Size | null => {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...buf.subarray(start, start + length));

  // PNG: IHDRのwidth/height(big endian)
  if (buf.length >= 24 && ascii(1, 3) === 'PNG') {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  // GIF: logical screen width/height(little endian)
  if (buf.length >= 10 && ascii(0, 3) === 'GIF') {
    return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
  }

  // WebP: VP8 / VP8L / VP8X
  if (buf.length >= 30 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    const chunk = ascii(12, 4);
    if (chunk === 'VP8 ') {
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    }
    if (chunk === 'VP8L') {
      const bits = view.getUint32(21, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8X') {
      const width = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1;
      const height = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1;
      return { width, height };
    }
    return null;
  }

  // JPEG: SOFnマーカーを探す
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) return null;
      const marker = buf[offset + 1];
      const length = view.getUint16(offset + 2);
      const isSof =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof) {
        return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
      }
      offset += 2 + length;
    }
  }

  return null;
};

const sizeCache = new Map<string, Promise<Size | null>>();

const fetchImageSize = (url: string): Promise<Size | null> => {
  let pending = sizeCache.get(url);
  if (!pending) {
    pending = fetch(url, { signal: AbortSignal.timeout(10_000) })
      .then(async (res) => (res.ok ? readImageSize(new Uint8Array(await res.arrayBuffer())) : null))
      .catch(() => null);
    sizeCache.set(url, pending);
  }
  return pending;
};

/**
 * 記事本文の<img>にwidth/heightを付与してCLSを防ぎ、ファーストビュー外の画像を遅延読み込みにする。
 * リンクカード(rlc-*)の画像はCSSで寸法が決まっているため対象外。
 */
const rehypeImageSize: Plugin<[], Root> = () => async (tree) => {
  const images: Element[] = [];
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'img' || typeof node.properties.src !== 'string') return;
    const className = node.properties.className;
    if (Array.isArray(className) && className.some((c) => String(c).startsWith('rlc-'))) return;
    images.push(node);
  });

  await Promise.all(
    images.map(async (node) => {
      node.properties.loading ??= 'lazy';
      node.properties.decoding = 'async';
      if (node.properties.width && node.properties.height) return;

      const size = await fetchImageSize(new URL(node.properties.src as string, ROOT_URL).href);
      if (size && size.width > 0 && size.height > 0) {
        node.properties.width = size.width;
        node.properties.height = size.height;
      }
    }),
  );
};

export default rehypeImageSize;
