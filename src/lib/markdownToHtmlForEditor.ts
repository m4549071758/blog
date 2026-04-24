import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeShiki from '@shikijs/rehype';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rlc from 'remark-link-card';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkYoutube from 'remark-youtube';
import { unified } from 'unified';
import rehypeResponsiveIframe from './rehypeResponsiveIframe';

export default async function markdownToHtmlForEditor(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm as any)
    .use(rlc)
    .use(remarkYoutube as any)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCodeTitles)
    .use(rehypeShiki, {
      theme: 'github-dark',
    })
    .use(rehypeSanitize, {
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), 'iframe'],
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
        span: [['className', /^token$/, /^rlc-./], 'style'],
        div: [['className', 'rehype-code-title', /^rlc-./]],
        pre: ['style', ['className', 'shiki', /^language-./]],
        a: [['className', /^rlc-./], 'href', 'target', 'rel'],
        img: [['className', /^rlc-./], 'src', 'alt', 'loading'],
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
