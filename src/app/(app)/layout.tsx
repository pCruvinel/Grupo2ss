'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMockAuth } from '../../../hooks/useMockAuth';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Toaster } from '../../../components/ui/sonner';
import { EmpresaProvider } from '../../../contexts/EmpresaContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useMockAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, router, mounted]);

  if (!mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F4788] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <EmpresaProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} currentPath={pathname} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <Toaster position="top-right" />
      </div>
    </EmpresaProvider>
  );
}