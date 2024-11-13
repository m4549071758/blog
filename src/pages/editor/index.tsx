import { useState } from 'react';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypeExternalLinks from 'rehype-external-links';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { MainLayout } from '@/components/features/app/Layout';

export default function Home() {
  const [markdown, setMarkdown] = useState<string>('# Hello, world!');
  const [html, setHtml] = useState<string>('');

  const handleMarkdownChange = async (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newMarkdown = event.target.value;
    setMarkdown(newMarkdown);
    const newHtml = await markdownToHtml(newMarkdown);
    setHtml(newHtml);
  };

  const markdownToHtml = async (markdown: string) => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeCodeTitles)
      .use(rehypePrism)
      .use(rehypeAutolinkHeadings)
      .use(rehypeExternalLinks, { target: '_blank', rel: ['nofollow'] })
      .use(rehypeSlug)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(markdown);

    return result.toString();
  };

  return (
    <MainLayout
      main={
        <div className="flex flex-row h-screen">
          <textarea
            className="w-1/2 p-4 border-r border-gray-300"
            value={markdown}
            onChange={handleMarkdownChange}
          />
          <div
            className="w-1/2 p-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      }
    />
  );
}
