'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostBody } from '@/components/features/post/Post/PostBody';
import { getPostBySlug, updatePost } from '@/lib/api';
import markdownToHtmlForEditor from '@/lib/markdownToHtmlForEditor';

export default function EditPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [post, setPost] = useState({
    title: '',
    content: '',
    slug: '',
    cover_image: '',
    excerpt: '',
    og_image: '',
    tags: '',
    datetime: '',
  });
  const [htmlContent, setHtmlContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    async function loadPost() {
      if (!id) return;

      try {
        const loadedPost = await getPostBySlug(id as string, [
          'title',
          'content',
          'slug',
          'coverImage',
          'excerpt',
          'ogImage',
          'tags',
          'date',
        ]);

        const formattedPost = {
          title: loadedPost.title || '',
          content: loadedPost.content || '',
          slug: loadedPost.slug || '',
          cover_image: loadedPost.coverImage || '',
          excerpt: loadedPost.excerpt || '',
          og_image:
            typeof loadedPost.ogImage === 'object' && loadedPost.ogImage?.url
              ? loadedPost.ogImage.url
              : typeof loadedPost.ogImage === 'string'
              ? loadedPost.ogImage
              : '',
          tags: Array.isArray(loadedPost.tags)
            ? loadedPost.tags.join(', ')
            : loadedPost.tags || '',
          datetime: loadedPost.date ? loadedPost.date.substring(0, 10) : '',
        };

        setPost(formattedPost);
        updatePreview(formattedPost.content);
      } catch (error) {
        console.error('記事の読み込みに失敗しました', error);
      }
    }

    loadPost();
  }, [id]);

  const updatePreview = async (markdown: string) => {
    const html = await markdownToHtmlForEditor(markdown);
    setHtmlContent(html);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setPost({ ...post, content: newContent });
    updatePreview(newContent);
  };

  const handleSave = async () => {
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

      await updatePost(id as string, postData);
      setSaveMessage('記事を保存しました');
    } catch (error) {
      console.error('保存に失敗しました', error);
      setSaveMessage('保存に失敗しました');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">記事の編集</h1>
        <div className="flex items-center gap-2">
          {saveMessage && (
            <span
              className={
                saveMessage.includes('失敗') ? 'text-red-500' : 'text-green-500'
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

      <div className="mb-4">
        <label htmlFor="title" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={post.title}
          onChange={(e) => setPost({ ...post, title: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="slug" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
          記事ID
        </label>
        <input
          type="text"
          id="slug"
          value={post.slug}
          onChange={(e) => setPost({ ...post, slug: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
          disabled
        />
      </div>

      <div className="mb-4">
        <label htmlFor="cover_image" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
          カバー画像URL
        </label>
        <input
          type="text"
          id="cover_image"
          value={post.cover_image || ''}
          onChange={(e) => setPost({ ...post, cover_image: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="excerpt" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
          抜粋
        </label>
        <textarea
          id="excerpt"
          value={post.excerpt || ''}
          onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
          className="w-full p-2 border rounded h-24 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="og_image" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
          OG画像URL
        </label>
        <input
          type="text"
          id="og_image"
          value={post.og_image || ''}
          onChange={(e) => setPost({ ...post, og_image: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="tags" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
          タグ（カンマ区切り）
        </label>
        <input
          type="text"
          id="tags"
          value={post.tags || ''}
          onChange={(e) => setPost({ ...post, tags: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
          placeholder="タグ1, タグ2, タグ3"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="datetime" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
          公開日
        </label>
        <input
          type="date"
          id="datetime"
          value={post.datetime ? post.datetime.substring(0, 10) : ''}
          onChange={(e) => setPost({ ...post, datetime: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-[600px]">
        <div className="w-full md:w-1/2 h-full">
          <label htmlFor="content" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            コンテンツ (Markdown)
          </label>
          <textarea
            id="content"
            value={post.content}
            onChange={handleContentChange}
            className="w-full h-[calc(100%-2rem)] p-2 border rounded font-mono dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
  );
}
