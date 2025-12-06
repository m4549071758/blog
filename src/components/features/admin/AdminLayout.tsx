'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainLayout } from '@/components/features/app/Layout';
import { BuildStatusIndicator } from '@/components/features/admin/BuildStatusIndicator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <ProtectedRoute>
      <MainLayout main={children} />
      <BuildStatusIndicator />
    </ProtectedRoute>
  );
}
