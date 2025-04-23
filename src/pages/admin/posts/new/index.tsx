import { useState } from 'react';
import { useRouter } from 'next/router';
import { PostBody } from '@/components/features/post/Post/PostBody';
import { createPost } from '@/lib/api';
import { getAuthToken } from '@/lib/authHandler';
import markdownToHtmlForEditor from '@/lib/markdownToHtmlForEditor';

export default function NewPostPage() {
  const router = useRouter();
  const authToken = getAuthToken();
  const [post, setPost] = useState({
    title: '',
    content: '',
    cover_image: '',
    excerpt: '',
    og_image: '',
    tags: '',
    datetime: new Date().toISOString().substring(0, 10),
  });

  const [htmlContent, setHtmlContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  if (!authToken) {
    console.log('ログインしてください');
    window.location.href = '/admin/login';
  }

  const handleImageDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
          const imageUrl = await imageUploadHandler(file);
          console.log(imageUrl);
          // ここにカーソル挿入処理書く予定
        } catch (error) {
          console.error('画像のアップロードに失敗しました', error);
        }
      }
    }
  };

  const imageUploadHandler = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('https://www.katori.dev/api/images/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });
    if (!response.ok) {
      console.log('画像のアップロードに失敗しました');
    }
    const data = await response.json();
    return data.image_url;
  };

  const updatePreview = async (markdown: string) => {
    const html = await markdownToHtmlForEditor(markdown);
    setHtmlContent(html);
  };

  // コンテンツ変更ハンドラ
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setPost({ ...post, content: newContent });
    updatePreview(newContent);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setPost({
      ...post,
      title: newTitle,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // 検証
      if (!post.title.trim()) {
        throw new Error('タイトルを入力してください');
      }

      if (!post.content.trim()) {
        throw new Error('コンテンツを入力してください');
      }

      // タグを配列に変換
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

      // 新規投稿作成APIを呼び出し
      const newPost = await createPost(postData);

      setSaveMessage('記事を作成しました');

      // 作成成功後、編集ページにリダイレクト
      setTimeout(() => {
        router.push(`/admin/posts/edit/${newPost.id}`);
      }, 1500);
    } catch (error) {
      console.error('保存に失敗しました', error);
      setSaveMessage(
        error instanceof Error ? error.message : '保存に失敗しました',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">新規記事作成</h1>
        <div className="flex items-center gap-2">
          {saveMessage && (
            <span
              className={
                saveMessage.includes('失敗') || saveMessage.includes('入力')
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
            {isSaving ? '保存中...' : '投稿する'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="title" className="block font-medium mb-1">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={post.title}
          onChange={handleTitleChange}
          className="w-full p-2 border rounded"
          placeholder="記事のタイトルを入力"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="cover_image" className="block font-medium mb-1">
          カバー画像URL
        </label>
        <input
          type="text"
          id="cover_image"
          value={post.cover_image}
          onChange={(e) => setPost({ ...post, cover_image: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="excerpt" className="block font-medium mb-1">
          抜粋
        </label>
        <textarea
          id="excerpt"
          value={post.excerpt}
          onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
          className="w-full p-2 border rounded h-24"
          placeholder="記事の簡単な説明を入力してください"
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="og_image" className="block font-medium mb-1">
          OG画像URL
        </label>
        <input
          type="text"
          id="og_image"
          value={post.og_image}
          onChange={(e) => setPost({ ...post, og_image: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/og-image.jpg"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="tags" className="block font-medium mb-1">
          タグ（カンマ区切り）
        </label>
        <input
          type="text"
          id="tags"
          value={post.tags}
          onChange={(e) => setPost({ ...post, tags: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="JavaScript, React, NextJS"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="datetime" className="block font-medium mb-1">
          公開日
        </label>
        <input
          type="date"
          id="datetime"
          value={post.datetime}
          onChange={(e) => setPost({ ...post, datetime: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-[600px]">
        <div className="w-full md:w-1/2 h-full">
          <label htmlFor="content" className="block font-medium mb-1">
            コンテンツ (Markdown)
          </label>
          <textarea
            id="content"
            value={post.content}
            onChange={handleContentChange}
            onDragOver={handleImageDragOver}
            onDrop={handleImageDrop}
            className="w-full h-[calc(100%-2rem)] p-2 border rounded font-mono"
            placeholder="# マークダウンで記事を作成できます"
          ></textarea>
        </div>

        <div className="w-full md:w-1/2 h-full">
          <h3 className="block font-medium mb-1">プレビュー</h3>
          <div className="w-full h-[calc(100%-2rem)] border rounded overflow-auto bg-white">
            <PostBody content={htmlContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
