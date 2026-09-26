import rehypeCodeTitles from 'rehype-code-titles';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rlc from 'remark-link-card';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkYoutube from 'remark-youtube';
import { unified } from 'unified';
import rehypeDiagrams from './rehypeDiagrams';
import {
  rehypeSaveCodeMeta,
  rehypeLoadCodeMeta,
} from './rehypeMetaStringBridge';
import rehypeNormalizeLang from './rehypeNormalizeLang';
import rehypeImageSize from './rehypeImageSize';
import rehypeResponsiveIframe from './rehypeResponsiveIframe';
import shikiLineNumberTransformer from './shikiLineNumberTransformer';

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm as any)
    .use(rlc, { downloadLimit: 10000000 })
    .use(remarkYoutube as any)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSaveCodeMeta)
    .use(rehypeRaw)
    .use(rehypeLoadCodeMeta)
    .use(rehypeDiagrams)
    .use(rehypeCodeTitles)
    .use(rehypeNormalizeLang)
    .use(rehypeShiki, {
      theme: 'github-dark',
      transformers: [shikiLineNumberTransformer()],
    })
    .use(rehypeSlug)
    .use(rehypeGithubAlerts as any, true)
    .use(rehypeResponsiveIframe)
    .use(rehypeImageSize)
    .use(rehypeSanitize, {
      ...defaultSchema,
      // rehype-github-alertsのdiv/svgを出すためのタグと属性
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
        span: [
          ...(defaultSchema.attributes?.span || []),
          ['className', /^line$/, /^line-number$/, 'line-number'],
          'style',
          'line',
        ],
        code: [['className', /^language-./]],
        div: [
          ...(defaultSchema.attributes?.div || []),
          [
            'className',
            'rehype-code-title',
            /^rlc-./,
            /^markdown-alert(-.*)?$/,
          ],
        ],
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
          ...(defaultSchema.attributes?.pre || []),
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
        a: [
          ...(defaultSchema.attributes?.a || []).filter(
            (attr) => !Array.isArray(attr) || attr[0] !== 'className',
          ),
          ['className', 'data-footnote-backref', /^rlc-./],
          'target',
          'rel',
        ],
        img: [
          ...(defaultSchema.attributes?.img || []),
          ['className', /^rlc-./, /^hover:/, 'transition-opacity'],
          'src',
          'alt',
          'loading',
          'decoding',
          'srcSet',
          'sizes',
        ],
      },
    })
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}
