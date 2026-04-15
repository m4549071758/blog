'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { PostBody } from '@/components/features/post/Post/PostBody';
import { createPost } from '@/lib/api';
import markdownToHtmlForEditor from '@/lib/markdownToHtmlForEditor';

export default function NewPostPage() {
  const router = useRouter();
  const [post, setPost] = useState({
    title: '',
    content: '',
    slug: '',
    cover_image: '',
    excerpt: '',
    og_image: '',
    tags: '',
    datetime: new Date().toISOString().split('T')[0],
  });
  const [htmlContent, setHtmlContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updatePreview = async (markdown: string) => {
    const html = await markdownToHtmlForEditor(markdown);
    setHtmlContent(html);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setPost({ ...post, content: newContent });
    updatePreview(newContent);
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://www.katori.dev/api/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const imageMarkdown = `![画像](${data.file_url})`;

        // カーソル位置に画像を挿入
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const text = post.content;
          const newText =
            text.substring(0, start) + imageMarkdown + text.substring(end);
          setPost({ ...post, content: newText });
          updatePreview(newText);
        }
      }
    } catch (error) {
      console.error('画像アップロードに失敗しました', error);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSave = async () => {
    if (!post.title || !post.slug || !post.content) {
      setSaveMessage('タイトル、記事ID、コンテンツは必須です');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const tagsArray = post.tags
        ? post.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag !== '')
        : [];

      const postData = {
        ...post,
        tags: tagsArray,
      };

      await createPost(postData);
      setSaveMessage('記事を作成しました');
      setTimeout(() => {
        router.push('/admin/posts');
      }, 2000);
    } catch (error) {
      console.error('保存に失敗しました', error);
      setSaveMessage('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">新規記事作成</h1>
          <div className="flex items-center gap-2">
            {saveMessage && (
              <span
                className={
                  saveMessage.includes('失敗') || saveMessage.includes('必須')
                    ? 'text-red-500'
                    : 'text-green-500'
                }
              >
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="title" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
              placeholder="記事のタイトル"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              記事ID (スラグ)
            </label>
            <input
              type="text"
              id="slug"
              value={post.slug}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
              placeholder="example-post-id"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="cover_image" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            カバー画像URL
          </label>
          <input
            type="text"
            id="cover_image"
            value={post.cover_image}
            onChange={(e) => setPost({ ...post, cover_image: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="excerpt" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            抜粋
          </label>
          <textarea
            id="excerpt"
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            className="w-full p-2 border rounded h-20 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            placeholder="記事の短い要約"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="tags" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              id="tags"
              value={post.tags}
              onChange={(e) => setPost({ ...post, tags: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
              placeholder="React, Next.js, TypeScript"
            />
          </div>
          <div>
            <label htmlFor="datetime" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              公開日
            </label>
            <input
              type="date"
              id="datetime"
              value={post.datetime}
              onChange={(e) => setPost({ ...post, datetime: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 h-[600px]">
          <div className="w-full md:w-1/2 h-full">
            <label htmlFor="content" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              コンテンツ (Markdown) - 画像をドロップしてアップロード
            </label>
            <textarea
              id="content"
              ref={textareaRef}
              value={post.content}
              onChange={handleContentChange}
              onDragOver={handleImageDragOver}
              onDrop={handleImageDrop}
              className="w-full h-[calc(100%-2rem)] p-2 border rounded font-mono dark:bg-gray-800 dark:text-white dark:border-gray-600"
              placeholder="# マークダウンで記事を作成できます"
            ></textarea>
          </div>

          <div className="w-full md:w-1/2 h-full">
            <h3 className="block font-medium mb-1 text-gray-700 dark:text-gray-300">プレビュー</h3>
            <div className="w-full h-[calc(100%-2rem)] border rounded overflow-auto bg-white dark:bg-gray-800">
              <PostBody content={htmlContent} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
