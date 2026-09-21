'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  useEffect(() => {
    const isAuthSession = 
      sessionStorage.getItem('admin_authenticated') === 'true' ||
      sessionStorage.getItem('isAdminAuthenticated') === 'true';
    const isAuthCookie = typeof document !== 'undefined' && document.cookie.includes('admin_authenticated=true');

    if (!isAuthSession && !isAuthCookie) {
      router.replace(`/${locale}/admin`);
      return;
    }

    // Quick client-side OK, now verify with server
    const verifyToken = async () => {
      try {
        const res = await fetch('/api/admin/verify');
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          setIsChecking(false);
        } else {
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('isAdminAuthenticated');
          document.cookie = 'admin_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          router.replace(`/${locale}/admin`);
        }
      } catch (e) {
        setIsAuthenticated(true); // Fallback to client check on error
        setIsChecking(false);
      }
    };

    verifyToken();
  }, [router, locale]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-navy-700 font-medium text-sm">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
