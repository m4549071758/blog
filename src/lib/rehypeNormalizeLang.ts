import { visit } from 'unist-util-visit';
import { bundledLanguages, bundledLanguagesAlias } from 'shiki';
import type { Plugin } from 'unified';
import type { Element } from 'hast';

/**
 * コードフェンスの言語名をShikiが解決できる形式へ正規化する。
 *
 * Shikiの言語IDはすべて小文字(typescript, bash, ...)だが、
 * 記事では ```TypeScript のように大文字混じりで書かれることがあり、
 * そのままでは rehypeShiki が「Language not found」になり
 * ハイライトされないpreが残る。
 *
 * このプラグインを rehypeShiki の前に置くと、language-* クラスを
 * bundledLanguages / bundledLanguagesAlias のキーへ
 * case-insensitive に解決した結果へ書き換える。
 * 解決できない言語名は何もしない(ShikiのfallbackLanguageに任せる)。
 */

// 大文字混じり言語名 → Shiki言語ID の索引(小文字キーで引く)
const langIndex: Record<string, string> = {};
for (const id of [
  ...Object.keys(bundledLanguages),
  ...Object.keys(bundledLanguagesAlias),
]) {
  langIndex[id.toLowerCase()] ??= id;
}

const rehypeNormalizeLang: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'code') return;
      const className = node.properties?.className;
      if (!Array.isArray(className)) return;

      node.properties.className = className.map((cls) => {
        if (typeof cls !== 'string' || !cls.startsWith('language-')) {
          return cls;
        }
        const lang = cls.slice('language-'.length);
        return langIndex[lang.toLowerCase()]
          ? `language-${langIndex[lang.toLowerCase()]}`
          : cls;
      });
    });
  };
};

export default rehypeNormalizeLang;
