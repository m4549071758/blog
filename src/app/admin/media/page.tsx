'use client';

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { RiDeleteBinLine, RiFileCopyLine, RiUploadCloud2Line } from 'react-icons/ri';
import { MainLayout } from '@/components/features/app/Layout';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { getAuthToken, isAuthenticated } from '@/lib/authHandler';
import { Image } from '@/components/common/Image';

interface MediaImage {
  file_name: string;
  file_url: string;
  article_id: string;
}

export default function MediaPage() {
  const router = useRouter();
  const [images, setImages] = useState<MediaImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();
      
      const response = await fetch('https://www.katori.dev/api/images', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('画像の取得に失敗しました');
      }

      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://www.katori.dev/api/images/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('アップロードに失敗しました');
      }

      await fetchImages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'アップロードエラー');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('本当にこの画像を削除しますか？')) return;

    try {
      const token = getAuthToken();
      // ファイル名には拡張子が含まれているので、拡張子を除いてIDとして検索させるか、
      // バックエンドがファイル名でも検索できるようにしたので、ファイル名から拡張子を除いたUUID部分抽出が必要かも？
      // いや、image_controllerを確認すると `id := c.Param("id")` で `Where("id = ? OR file_name = ?", id, id)` としているので
      // ファイル名をそのまま送ればOK。
      
      const response = await fetch(`https://www.katori.dev/api/images/${fileName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      await fetchImages();
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除エラー');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URLをコピーしました');
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">メディア管理</h1>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <RiUploadCloud2Line />
            {isUploading ? 'アップロード中...' : '画像を追加'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.file_name} className="relative group bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden aspect-square border border-gray-200 dark:border-gray-700">
              <div className="w-full h-full p-2">
                <Image
                  src={img.file_url}
                  alt={img.file_name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => copyToClipboard(img.file_url)}
                  className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100"
                  title="URLをコピー"
                >
                  <RiFileCopyLine />
                </button>
                <button
                  onClick={() => handleDelete(img.file_name)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="削除"
                >
                  <RiDeleteBinLine />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate text-center">
                {img.file_name}
              </div>
            </div>
          ))}
          
          {images.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              画像が見つかりません
            </div>
          )}
        </div>
      )}
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
}
