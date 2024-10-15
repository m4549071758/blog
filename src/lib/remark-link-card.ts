import { visit } from 'unist-util-visit';

export default function remarkLinkCard() {
  return (tree: any) => {
    visit(tree, 'link', (node: any) => {
      const url = node.url;
      const title = node.children[0]?.value || url;
      const cardHtml = `
        <div class="link-card">
          <a href="${url}" target="_blank" rel="noopener noreferrer">
            <div class="link-card-content">
              <h3>${title}</h3>
              <p>${url}</p>
            </div>
          </a>
        </div>
      `;
      node.type = 'html';
      node.value = cardHtml;
      node.children = [];
    });
  };
}