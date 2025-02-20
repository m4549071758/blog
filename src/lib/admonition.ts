import { visit } from 'unist-util-visit';

export default function rehypeAdmonitionClass() {
  return (tree: any) => {
    visit(tree, 'element', (node) => {
      if (
        node.tagName === 'div' &&
        node.properties?.className?.includes('admonition')
      ) {
        const titleNode = node.children.find(
          (child: any) =>
            child.tagName === 'p' &&
            child.properties.className?.includes('admonition-title'),
        );
        if (titleNode) {
          const titleText = titleNode.children[0]?.value?.toLowerCase();
          if (titleText) {
            node.properties.className.push(`admonition-${titleText}`);
          }
        }
      }
    });
  };
}
