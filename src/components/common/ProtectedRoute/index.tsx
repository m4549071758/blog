'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateToken } from '@/lib/authenticationHandler';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateToken();

        if (!isValid) {
          // 認証失敗時はログインページへリダイレクト
          router.push('/admin/login');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth validation error:', error);
        router.push('/admin/login');
      } finally {
        setIsValidating(false);
      }
    };

    checkAuth();
  }, [router]);

  // 認証チェック中はローディング表示
  if (isValidating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 認証済みの場合のみコンテンツを表示
  return isAuthenticated ? <>{children}</> : null;
};
