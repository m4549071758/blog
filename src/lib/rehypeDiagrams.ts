import type { Plugin } from 'unified';
import type { Element, Parent, ElementContent } from 'hast';
import { visit } from 'unist-util-visit';
/**
 * ```mermaid / ```plantuml コードブロックを
 * クライアントサイド描画用のプレースホルダへ置き換えるrehypeプラグイン。
 *
 * 出力:
 *   mermaid   -> <pre class="diagram mermaid" data-diagram-source="...">...
 *   plantuml  -> <pre class="diagram plantuml" data-diagram-source="...">...
 */
const rehypeDiagrams: Plugin = () => {
  return (tree) => {
    visit(
      tree,
      'element',
      (node: Element, index: number | null, parent: Parent | null) => {
        if (node.tagName !== 'pre' || !parent || typeof index !== 'number')
          return;

        const code = node.children.find(
          (child): child is Element =>
            child.type === 'element' && child.tagName === 'code',
        );
        if (!code) return;

        const lang = String(code.properties?.className || '')
          .match(/language-([\w-]+)/)?.[1]
          ?.toLowerCase();
        if (lang !== 'mermaid' && lang !== 'plantuml') return;

        const source = code.children
          .map((child) => (child.type === 'text' ? child.value : ''))
          .join('')
          .trim();
        if (!source) return;

        const placeholder: Element = {
          type: 'element',
          tagName: 'pre',
          properties: {
            className: ['diagram', lang],
            dataDiagramSource: source,
          },
          children: [],
        };

        parent.children[index] = placeholder as ElementContent;
      },
    );
  };
};

export default rehypeDiagrams;
