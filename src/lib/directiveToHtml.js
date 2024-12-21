import { visit } from 'unist-util-visit';

function directiveToHtml() {
  return (tree) => {
    visit(tree, (node) => {
      // containerDirective ノードのみ処理する
      if (node.type === 'containerDirective') {
        const data = node.data || (node.data = {});

        // ディレクティブ名を取得（例: info, warning, error）
        const directiveType = node.name;

        // hName（タグ名）とクラス名を設定
        data.hName = 'div';
        data.hProperties = { className: [`alert-${directiveType}`] };

        // タイトルの自動追加（必要に応じて）
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
