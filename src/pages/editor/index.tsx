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
import { PostBody } from '@/components/features/post/Post/PostBody'; // 追加

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
      .use(rehypePrism, { ignoreMissing: true })
      .use(rehypeAutolinkHeadings)
      .use(rehypeExternalLinks)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .use(rehypeSlug)
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
          <div className="w-1/2 p-4">
            <PostBody content={html} />{' '}
            {/* 修正：PostBodyコンポーネントを使用 */}
          </div>
        </div>
      }
    />
  );
}
