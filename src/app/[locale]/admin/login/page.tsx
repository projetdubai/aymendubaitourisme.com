'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RedirectToAdminLogin() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  useEffect(() => {
    router.replace(`/${locale}/admin`);
  }, [router, locale]);

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}