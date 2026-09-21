'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function VisitorTracker() {
  const pathname = usePathname();
  const locale = useLocale();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid re-tracking identical path within same navigation or tracking admin routes
    if (!pathname || pathname.includes('/admin') || pathname === lastTrackedPath.current) {
      return;
    }

    lastTrackedPath.current = pathname;

    // Fire-and-forget beacon or fetch
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, locale: locale || 'fr' }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, [pathname, locale]);

  return null;
}
