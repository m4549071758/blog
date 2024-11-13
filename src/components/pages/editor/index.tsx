import { useState } from 'react';
import { MainLayout } from '@/components/features/app/Layout';
import markdownToHtml from '@/lib/markdownToHtml';

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
