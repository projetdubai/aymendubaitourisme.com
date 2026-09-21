'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RedirectProperties() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  useEffect(() => {
    router.replace(`/${locale}/admin/dashboard/properties`);
  }, [router, locale]);

  return null;
}
