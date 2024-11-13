import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl">管理者ページ</h1>
      </header>
      <main className="flex-grow p-4 bg-gray-100">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2023 管理者ページ
      </footer>
    </div>
  );
};
