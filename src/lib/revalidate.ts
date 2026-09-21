import { revalidatePath } from 'next/cache';
import { cloudDb } from './cloud-db';

const LOCALES = ['fr', 'ar', 'en'] as const;

/**
 * Trigger instant on-demand ISR revalidation across all locales and layout levels.
 * Purgers both in-memory cloudDb caches and Next.js static / SSR page caches
 * so changes reflect on the live website in less than 1 second.
 */
export async function revalidateSite(entity?: string) {
  // 1. Invalidate multi-tier runtime memory cache
  cloudDb.invalidate(entity);

  // 2. Revalidate root Next.js layout and root page
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
  } catch (err) {
    console.warn('[revalidateSite] Root revalidation notice:', err);
  }

  // 3. Revalidate locale-specific routes
  for (const locale of LOCALES) {
    try {
      revalidatePath(`/${locale}`, 'layout');
      revalidatePath(`/${locale}`, 'page');

      if (!entity || entity === 'all' || entity === 'site_content' || entity.startsWith('messages_') || entity === 'navbar') {
        revalidatePath(`/${locale}/cars`, 'page');
        revalidatePath(`/${locale}/visa`, 'page');
        revalidatePath(`/${locale}/flights`, 'page');
        revalidatePath(`/${locale}/services`, 'page');
        revalidatePath(`/${locale}/real-estate`, 'page');
        revalidatePath(`/${locale}/reviews`, 'page');
        revalidatePath(`/${locale}/contact`, 'page');
        revalidatePath(`/${locale}/quote`, 'page');
      } else if (entity === 'cars') {
        revalidatePath(`/${locale}/cars`, 'page');
        revalidatePath(`/${locale}/quote`, 'page');
      } else if (entity === 'visas') {
        revalidatePath(`/${locale}/visa`, 'page');
        revalidatePath(`/${locale}/quote`, 'page');
      } else if (entity === 'flights') {
        revalidatePath(`/${locale}/flights`, 'page');
        revalidatePath(`/${locale}/quote`, 'page');
      } else if (entity === 'services') {
        revalidatePath(`/${locale}/services`, 'page');
        revalidatePath(`/${locale}/quote`, 'page');
      } else if (entity === 'properties') {
        revalidatePath(`/${locale}/real-estate`, 'page');
        revalidatePath(`/${locale}/quote`, 'page');
      } else if (entity === 'reviews') {
        revalidatePath(`/${locale}/reviews`, 'page');
      }
    } catch (err) {
      console.warn(`[revalidateSite] Revalidation notice for locale "${locale}":`, err);
    }
  }
}
