'use client';

import { useEffect } from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';
import tocbot from 'tocbot';
import { useBreakPoint } from '@/hooks/useBreakPoint';

export const Toc: React.VFC = () => {
  useEffect(() => {
    tocbot.init({
      tocSelector: '.toc',
      contentSelector: '.post',
      headingSelector: 'h1, h2, h3',
      scrollSmoothOffset: -80,
    });

    return () => tocbot.destroy();
  }, []);

  return (
    <div className="select-none vstack gap-3 p-6 bg-primary-1">
      <div className="center">
        <div className="center gap-2 py-2 px-3 border-b-2 border-teal-700 dark:border-teal-400 text-base font-bold text-primary-1">
          <MdOutlineContentCopy />
          目次
        </div>
      </div>
      <nav className="toc" />
    </div>
  );
};

// PCではサイドバーに表示し、モバイルではハンバーガーメニュー内(TocMenu)に任せる。
export const DesktopToc: React.VFC = () => {
  const lg = useBreakPoint('lg');
  return lg ? <Toc /> : null;
};

// 目次リンクを押したらメニューを閉じる。
export const TocMenu: React.VFC = () => (
  <div
    role="presentation"
    onClick={() =>
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    }
    className="overflow-y-auto cursor-default"
  >
    <Toc />
  </div>
);
