import { visit } from 'unist-util-visit';
import type { Element, ElementContent } from 'hast';

export default function rehypeAdmonitionClass() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element) => {
      if (
        node.tagName === 'div' &&
        node.properties?.className &&
        Array.isArray(node.properties.className) &&
        node.properties.className.includes('admonition')
      ) {
        const titleNode = node.children.find((child: ElementContent) => {
          return (
            child.type === 'element' &&
            child.tagName === 'p' &&
            child.properties?.className &&
            Array.isArray(child.properties.className) &&
            child.properties.className.includes('admonition-title')
          );
        }) as Element | undefined;
        if (titleNode && titleNode.children.length > 0) {
          const firstChild = titleNode.children[0];
          if (firstChild.type === 'text') {
            const titleText = firstChild.value?.toLowerCase();
            if (titleText && Array.isArray(node.properties.className)) {
              node.properties.className.push(`admonition-${titleText}`);
            }
          }
        }
      }
    });
  };
}
