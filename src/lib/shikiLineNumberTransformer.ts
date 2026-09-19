import type { ShikiTransformer } from 'shiki';
import type { Element } from 'hast';

/**
 * rehype-prism-plus互換の行番号transformer。
 * コードフェンスのmetaに showLineNumbers がある場合のみ、
 * Shikiの各行spanに class="line line-number" と line="<n>" を付与する。
 * 番号の表示は styles/prism.css の .line-number::before { content: attr(line) } が行う。
 *
 * 注意: classNameは配列形式で設定する。rehype-sanitizeは文字列形式の
 * classNameを許可リスト評価できずにクラスを落とすため。
 */
const shikiLineNumberTransformer = (): ShikiTransformer => {
  return {
    name: 'blog:show-line-numbers',
    pre(node) {
      const raw = String(this.options.meta?.__raw || '');
      if (!raw.includes('showLineNumbers')) return;

      const code = node.children.find(
        (child): child is Element =>
          child.type === 'element' && child.tagName === 'code',
      );
      if (!code) return;

      let line = 1;
      for (const child of code.children) {
        if (
          child.type === 'element' &&
          child.tagName === 'span' &&
          child.properties?.class === 'line'
        ) {
          child.properties.line = String(line);
          child.properties.className = ['line', 'line-number'];
          delete child.properties.class;
          line++;
        }
      }
    },
  };
};

export default shikiLineNumberTransformer;
