import { useState } from 'react';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import plugin from 'remark-github-beta-blockquote-admonitions';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { MainLayout } from '@/components/features/app/Layout';
import { PostBody } from '@/components/features/post/Post/PostBody';

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

  const handleSaveDraft = () => {
    console.log('下書き保存:', markdown);
  };

  const handleSubmit = () => {
    console.log('送信:', markdown);
  };

  const markdownToHtml = async (markdown: string) => {
    const options = {};
    const result = await unified()
      .use(remarkParse)
      .use(remarkBreaks)
      .use(plugin, options)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeCodeTitles)
      .use(rehypePrism, { ignoreMissing: true })
      .use(rehypeAutolinkHeadings)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .use(rehypeSlug)
      .use(rehypeGithubAlerts, true)
      .process(markdown);

    return result.toString();
  };

  return (
    <MainLayout
      main={
        <>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveDraft}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              下書き保存
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              送信
            </button>
          </div>
          <div className="custom-page">
            <ScrollSync>
              <div className="h-[90vh] w-[90vw] mx-auto flex flex-row">
                <ScrollSyncPane>
                  <textarea
                    className="w-1/2 p-4 border-r border-gray-300 overflow-auto"
                    value={markdown}
                    onChange={handleMarkdownChange}
                  />
                </ScrollSyncPane>
                <ScrollSyncPane>
                  <div className="w-1/2 p-4 overflow-auto">
                    <PostBody content={html} />
                  </div>
                </ScrollSyncPane>
              </div>
            </ScrollSync>
          </div>
        </>
      }
    />
  );
}
