import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeShiki from '@shikijs/rehype';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rlc from 'remark-link-card';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkYoutube from 'remark-youtube';
import { unified } from 'unified';
import rehypeResponsiveIframe from './rehypeResponsiveIframe';

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm as any)
    .use(rlc, { downloadLimit: 10000000 })
    .use(remarkYoutube as any)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
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
        span: [...(defaultSchema.attributes?.span || []), ['className', /^token$/, /^rlc-./], 'style'],
        div: [...(defaultSchema.attributes?.div || []), ['className', 'rehype-code-title', /^rlc-./]],
        pre: [...(defaultSchema.attributes?.pre || []), 'style', ['className', 'shiki', /^language-./]],
        a: [
          ...(defaultSchema.attributes?.a || []).filter((attr) => !Array.isArray(attr) || attr[0] !== 'className'),
          ['className', 'data-footnote-backref', /^rlc-./],
          'target',
          'rel'
        ],
        img: [...(defaultSchema.attributes?.img || []), ['className', /^rlc-./, /^hover:/, 'transition-opacity'], 'src', 'alt', 'loading', 'style'],
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
