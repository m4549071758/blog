import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeShiki from '@shikijs/rehype';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkYoutube from 'remark-youtube';
import { unified } from 'unified';
import rehypeDiagrams from './rehypeDiagrams';
import rehypeResponsiveIframe from './rehypeResponsiveIframe';
export default async function markdownToHtmlForEditor(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm as any)
    .use(remarkYoutube as any)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeDiagrams)
    .use(rehypeShiki, {
      theme: 'github-dark',
    })
    .use(rehypeSanitize, {
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), 'iframe', 'svg', 'path'],
      attributes: {
        ...defaultSchema.attributes,
        iframe: [
          'src',
          'width',
          'height',
          'title',
          'allow',
          'allowfullscreen',
          'frameborder',
          'scrolling',
        ],
        code: [['className', /^language-./]],
        span: [['className', /^token$/], 'style'],
        div: [['className', 'rehype-code-title', /^markdown-alert(-.*)?$/]],
        p: [
          ...(defaultSchema.attributes?.p || []),
          ['className', 'markdown-alert-title'],
        ],
        svg: [
          ['className', /^octicon/],
          'viewBox',
          'width',
          'height',
          'aria-hidden',
          'version',
        ],
        path: ['d'],
        pre: [
          'style',
          [
            'className',
            'shiki',
            /^language-./,
            'diagram',
            'mermaid',
            'plantuml',
          ],
          'dataDiagramSource',
        ],
      },
    })
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify)
    .use(rehypeSlug)
    .use(rehypeGithubAlerts as any, true)
    .use(rehypeResponsiveIframe)
    .process(markdown);

  return result.toString();
}
