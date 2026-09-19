import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element } from 'hast';

/**
 * rehype-raw はhast要素をHTML文字列へ分解して再構築するため、
 * code.data.meta(コードフェンスのmeta文字列、例: showLineNumbers)が失われる。
 * Shiki(@shikijs/rehype)は code.data.meta を読むため、rehype-raw を
 * 通すパイプラインでは行番号指定などが効かなくなる。
 *
 * rehypeSaveCodeMeta を rehype-raw の前に、rehypeLoadCodeMeta を
 * rehype-raw の後に置くこと。properties.metastring はHTML属性として
 * raw再構築を生き残るため、これを退避領域に使う。
 * unifiedは同一プラグイン関数を複数回useすると一度しかattachしないため、
 * 保存と復元は別関数に分けてある。
 */

/** rehype-raw 前: code.data.meta を properties.metastring へ退避する */
export const rehypeSaveCodeMeta: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'code') return;
      const dataMeta = node.data?.meta as string | undefined;
      if (dataMeta && !node.properties?.metastring) {
        node.properties = { ...node.properties, metastring: dataMeta };
      }
    });
  };
};

/** rehype-raw 後: properties.metastring から code.data.meta へ復元する */
export const rehypeLoadCodeMeta: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'code') return;
      const metastring = node.properties?.metastring as string | undefined;
      if (metastring && !node.data?.meta) {
        node.data = { ...node.data, meta: metastring };
        delete node.properties.metastring;
      }
    });
  };
};
