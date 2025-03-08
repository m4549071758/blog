import h from 'hastscript';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const rehypeResponsiveIframe: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: any, index, parent) => {
      if (
        node.tagName === 'p' &&
        node.children.length === 1 &&
        node.children[0].tagName === 'iframe' &&
        parent &&
        typeof index === 'number'
      ) {
        const iframe = node.children[0];

        const wrapper = h(
          'div',
          {
            className: 'relative w-full max-w-4xl mx-auto pb-[56.25%] h-0',
            style: 'aspect-ratio: 16/9;', // スタイル属性を追加
          },
          [
            h('iframe', {
              ...iframe.properties,
              className: 'absolute top-0 left-0 w-full h-full',
              style: 'height: 100% !important; min-height: 300px;', // 高さを強制的に設定
              width: '100%',
              frameBorder: '0',
              allowFullScreen: true,
            }),
          ],
        );

        parent.children[index] = wrapper;
      }
    });
  };
};

export default rehypeResponsiveIframe;
