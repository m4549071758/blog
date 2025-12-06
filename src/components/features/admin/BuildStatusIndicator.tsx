'use client';

import { useState, useEffect, useRef } from 'react';
import { getAuthToken } from '@/lib/authHandler';

type BuildState = 'idle' | 'running' | 'success' | 'failed';

interface BuildStatus {
  state: BuildState;
  logs: string[];
  start_time: string;
  end_time: string;
  action: string;
  article_id: string;
}

export const BuildStatusIndicator = () => {
  const [status, setStatus] = useState<BuildStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<BuildState>('idle');

  const fetchStatus = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('https://www.katori.dev/api/build-status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: BuildStatus = await response.json();
        
        // 状態が変わったときの処理
        if (prevStatusRef.current !== data.state) {
          if (data.state === 'running') {
            setShowNotification(true);
          } else if (data.state === 'success' || data.state === 'failed') {
            // 完了後はしばらく通知を表示してから消す（ただしログを開いている場合は消さない）
            if (!isOpen) {
              setTimeout(() => setShowNotification(false), 5000);
            }
          }
        }
        
        prevStatusRef.current = data.state;
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch build status:', error);
    }
  };

  // 定期ポーリング
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // 3秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  // ログの自動スクロール
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status?.logs, isOpen]);

  if (!status || status.state === 'idle') {
    return null;
  }

  // 通知だけ表示しているモード
  if (!isOpen && showNotification) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg cursor-pointer transition-all transform hover:scale-105 ${
            status.state === 'running' ? 'bg-blue-600 text-white' :
            status.state === 'success' ? 'bg-green-600 text-white' :
            'bg-red-600 text-white'
          }`}
          onClick={() => setIsOpen(true)}
        >
          {status.state === 'running' && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          )}
          <div className="font-medium">
            {status.state === 'running' ? 'ビルド実行中...' :
             status.state === 'success' ? 'ビルド成功！' :
             'ビルド失敗'}
          </div>
          <div className="text-xs opacity-80 border-l border-white/30 pl-2 ml-2">
            ログを見る
          </div>
        </div>
      </div>
    );
  }

  // ログ詳細表示モード
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                ビルドステータス: 
                <span className={`ml-2 ${
                  status.state === 'running' ? 'text-blue-600' :
                  status.state === 'success' ? 'text-green-600' :
                  'text-red-600'
                }`}>
                  {status.state.toUpperCase()}
                </span>
              </h3>
              {status.state === 'running' && <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />}
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                if (status.state !== 'running') setShowNotification(false);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              閉じる
            </button>
          </div>

          {/* Info */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700 flex gap-4">
            <span>Action: {status.action}</span>
            <span>Article ID: {status.article_id}</span>
            <span>Start: {new Date(status.start_time).toLocaleString()}</span>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-auto p-4 bg-gray-950 text-gray-200 font-mono text-xs md:text-sm">
            {status.logs.length === 0 ? (
              <div className="text-gray-500 italic">No logs available...</div>
            ) : (
              status.logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap mb-1 border-b border-gray-800/50 pb-1">
                  {log}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
