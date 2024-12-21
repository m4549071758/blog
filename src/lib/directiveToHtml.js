import { visit } from 'unist-util-visit';

function directiveToHtml() {
  return (tree) => {
    visit(tree, (node) => {
      // containerDirectiveノードのみ
      if (node.type === 'containerDirective') {
        const data = node.data || (node.data = {});

        // ディレクティブ名（info, warning, error）
        const directiveType = node.name;

        // タグとクラス名
        data.hName = 'div';
        data.hProperties = { className: [`alert-${directiveType}`] };

        // タイトルの追加
        if (node.children && node.children.length > 0) {
          node.children.unshift({
            type: 'element',
            tagName: 'strong',
            properties: {},
            children: [{ type: 'text', value: directiveType.toUpperCase() }],
          });
        }
      }
    });
  };
}

export default directiveToHtml;
