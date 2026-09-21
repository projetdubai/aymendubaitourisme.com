import fs from 'fs';
import path from 'path';
import os from 'os';
import { cloudDb } from './cloud-db';

export interface ReviewItem {
  id: string;
  author_name: string;
  name?: string;
  rating: number; // 1 to 5
  service: string;
  comment: string;
  text?: string;
  country?: string;
  created_at: string;
  date?: string;
  status: 'pending' | 'approved' | 'rejected';
}

declare global {
  var __reviews_cache: ReviewItem[] | undefined;
}

const PRIMARY_REVIEWS_FILE = path.join(process.cwd(), 'src', 'data', 'reviews.json');
const TMP_REVIEWS_FILE = path.join(os.tmpdir(), 'aymen_reviews.json');

// Default initial reviews if files are empty
const INITIAL_BASELINE_REVIEWS: ReviewItem[] = [
  {
    id: 'R-001',
    author_name: 'Mohammed Al-Rashid',
    name: 'Mohammed Al-Rashid',
    country: 'Saudi Arabia 🇸🇦',
    rating: 5,
    service: 'تأشيرة دبي والسياحة',
    comment: 'AYMEN DUBAI TOURISME provided excellent visa services. The process was smooth, fast, and highly professional. Highly recommended!',
    text: 'AYMEN DUBAI TOURISME provided excellent visa services. The process was smooth, fast, and highly professional. Highly recommended!',
    created_at: '2024-01-15T10:30:00.000Z',
    date: '2024-01-15',
    status: 'approved'
  },
  {
    id: 'R-002',
    author_name: 'Marie Dupont',
    name: 'Marie Dupont',
    country: 'France 🇫🇷',
    rating: 5,
    service: 'Réservation Hôtels VIP',
    comment: 'Ils ont trouvé l\'hôtel de luxe parfait pour notre séjour à Dubaï. Accueil exceptionnel et service impeccable.',
    text: 'Ils ont trouvé l\'hôtel de luxe parfait pour notre séjour à Dubaï. Accueil exceptionnel et service impeccable.',
    created_at: '2024-02-02T14:15:00.000Z',
    date: '2024-02-02',
    status: 'approved'
  },
  {
    id: 'R-003',
    author_name: 'Ahmed Benali',
    name: 'Ahmed Benali',
    country: 'Algeria 🇩🇿',
    rating: 5,
    service: 'تأشيرة قطر وسلطنة عُمان',
    comment: 'خدمة سريعة وموثوقة للحصول على التأشيرات وحجز الفنادق في دبي والخليج. شكراً جزيلاً للأخ أيمن وفريقه.',
    text: 'خدمة سريعة وموثوقة للحصول على التأشيرات وحجز الفنادق في دبي والخليج. شكراً جزيلاً للأخ أيمن وفريقه.',
    created_at: '2024-03-10T09:00:00.000Z',
    date: '2024-03-10',
    status: 'approved'
  },
  {
    id: 'R-004',
    author_name: 'Sarah Johnson',
    name: 'Sarah Johnson',
    country: 'United Kingdom 🇬🇧',
    rating: 5,
    service: 'Real Estate Investment',
    comment: 'Very helpful in our search for a Dubai property. They showed us great options in Downtown Dubai and handled everything efficiently.',
    text: 'Very helpful in our search for a Dubai property. They showed us great options in Downtown Dubai and handled everything efficiently.',
    created_at: '2024-03-22T16:45:00.000Z',
    date: '2024-03-22',
    status: 'approved'
  },
  {
    id: 'R-005',
    author_name: 'Karim Cherif',
    name: 'Karim Cherif',
    country: 'Tunisia 🇹🇳',
    rating: 5,
    service: 'تأجير السيارات الفخمة',
    comment: 'استأجرت سيارة رينج روفر سبورت، السيارة كانت في حالة وكالة جديدة تماماً والتسليم في المطار كان في الموعد.',
    text: 'استأجرت سيارة رينج روفر سبورت، السيارة كانت في حالة وكالة جديدة تماماً والتسليم في المطار كان في الموعد.',
    created_at: '2024-04-14T11:20:00.000Z',
    date: '2024-04-14',
    status: 'approved'
  }
];

function normalizeReview(r: any): ReviewItem {
  const author = r.author_name || r.name || 'Client Aymen Dubai';
  const commentText = r.comment || r.text || '';
  const dateStr = r.created_at || (r.date ? new Date(r.date).toISOString() : new Date().toISOString());
  const shortDate = r.date || dateStr.split('T')[0];

  return {
    id: r.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    author_name: author,
    name: author,
    rating: typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5 ? r.rating : 5,
    service: r.service || 'Service Général Dubaï',
    comment: commentText,
    text: commentText,
    country: r.country || 'Dubaï / Voyageur',
    created_at: dateStr,
    date: shortDate,
    status: r.status === 'approved' || r.status === 'rejected' ? r.status : 'pending',
  };
}

export function readAllReviews(): ReviewItem[] {
  // 1. Check in-memory cache
  if (globalThis.__reviews_cache && globalThis.__reviews_cache.length > 0) {
    return globalThis.__reviews_cache;
  }

  let loadedReviews: ReviewItem[] = [];

  // 2. Try primary JSON file first (disk source of truth)
  try {
    if (fs.existsSync(PRIMARY_REVIEWS_FILE)) {
      const fileData = fs.readFileSync(PRIMARY_REVIEWS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedReviews = parsed.map(normalizeReview);
      }
    }
  } catch (err) {
    console.warn('Could not read primary reviews file:', err);
  }

  // 3. If primary is empty or missing, try tmp file (contains latest runtime submissions on serverless)
  if (loadedReviews.length === 0) {
    try {
      if (fs.existsSync(TMP_REVIEWS_FILE)) {
        const tmpData = fs.readFileSync(TMP_REVIEWS_FILE, 'utf-8');
        const parsed = JSON.parse(tmpData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedReviews = parsed.map(normalizeReview);
        }
      }
    } catch (err) {
      console.warn('Could not read tmp reviews file:', err);
    }
  }

  // 4. If still empty, use baseline
  if (loadedReviews.length === 0) {
    loadedReviews = INITIAL_BASELINE_REVIEWS;
  }

  // Cache in memory
  globalThis.__reviews_cache = loadedReviews;
  return loadedReviews;
}

export async function readAllReviewsAsync(): Promise<ReviewItem[]> {
  // 1. Try Cloud DB first for real-time consistency across serverless instances
  try {
    const cloudReviews = await cloudDb.get<any[]>('reviews');
    if (Array.isArray(cloudReviews) && cloudReviews.length > 0) {
      const normalized = cloudReviews.map(normalizeReview);
      globalThis.__reviews_cache = normalized;
      return normalized;
    }
  } catch (err) {
    console.warn('[reviews] Cloud DB read error, falling back to disk/tmp:', err);
  }

  // 2. Direct Prisma table fallback
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('./prisma');
      const dbReviews = await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (Array.isArray(dbReviews) && dbReviews.length > 0) {
        const mapped: ReviewItem[] = dbReviews.map((r) => ({
          id: r.id,
          author_name: r.name,
          name: r.name,
          country: r.country,
          rating: r.rating,
          service: 'Service Dubaï',
          comment: r.review,
          text: r.review,
          created_at: r.createdAt.toISOString(),
          date: r.createdAt.toISOString().split('T')[0],
          status: r.status === 'APPROVED' ? 'approved' : r.status === 'REJECTED' ? 'rejected' : 'pending',
        }));
        globalThis.__reviews_cache = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn('[reviews] prisma.review read error:', err);
    }
  }

  // 3. Fall back to local synchronous reader
  return readAllReviews();
}

export async function saveAllReviewsAsync(reviews: ReviewItem[]): Promise<boolean> {
  const normalized = reviews.map(normalizeReview);
  globalThis.__reviews_cache = normalized;

  let success = false;

  // 1. Save to primary JSON (local dev & persistent VPS)
  try {
    const dir = path.dirname(PRIMARY_REVIEWS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_REVIEWS_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    success = true;
  } catch (err) {
    // Expected on Vercel read-only filesystem
    console.warn('Could not write primary reviews file (read-only environment):', err);
  }

  // 2. Always save to tmp directory (writable on Vercel lambda / serverless)
  try {
    fs.writeFileSync(TMP_REVIEWS_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    success = true;
  } catch (err) {
    console.error('Could not write to tmp reviews file:', err);
  }

  // 3. Save to cloud DB and invalidate caches
  try {
    await cloudDb.set('reviews', normalized);
    cloudDb.invalidate('reviews');
    success = true;
  } catch (err) {
    console.error('Error persisting reviews to cloudDb:', err);
  }

  // 4. Also systematically sync using prisma.review.upsert()
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('./prisma');
      for (const r of normalized) {
        const statusEnum = (r.status === 'approved' ? 'APPROVED' : r.status === 'rejected' ? 'REJECTED' : 'PENDING') as any;
        await prisma.review.upsert({
          where: { id: r.id },
          update: {
            name: r.author_name || r.name || 'Visiteur',
            country: r.country || 'Dubaï',
            rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
            review: r.comment || r.text || '',
            status: statusEnum,
            updatedAt: new Date(),
          },
          create: {
            id: r.id,
            name: r.author_name || r.name || 'Visiteur',
            country: r.country || 'Dubaï',
            rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
            review: r.comment || r.text || '',
            status: statusEnum,
            createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          },
        });
      }
    } catch (err) {
      console.warn('Could not sync to prisma.review via upsert:', err);
    }
  }

  return success;
}


export function saveAllReviews(reviews: ReviewItem[]): boolean {
  saveAllReviewsAsync(reviews).catch((err) => console.error('saveAllReviewsAsync failed:', err));
  return true;
}

export async function getApprovedReviewsAsync(): Promise<ReviewItem[]> {
  const all = await readAllReviewsAsync();
  return all
    .filter((r) => r.status === 'approved')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getApprovedReviews(): ReviewItem[] {
  const all = readAllReviews();
  return all
    .filter((r) => r.status === 'approved')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPendingReviewsCount(): number {
  const all = readAllReviews();
  return all.filter((r) => r.status === 'pending').length;
}

export async function addCustomerReviewAsync(data: {
  author_name?: string;
  name?: string;
  rating: number;
  service?: string;
  comment?: string;
  review?: string;
  text?: string;
  country?: string;
}): Promise<ReviewItem> {
  const all = await readAllReviewsAsync();
  const author = (data.author_name || data.name || 'Visiteur').trim();
  const comment = (data.comment || data.review || data.text || '').trim();
  const now = new Date();

  const newReview: ReviewItem = {
    id: `REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    author_name: author,
    name: author,
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    service: (data.service || 'Service Dubaï').trim(),
    comment,
    text: comment,
    country: (data.country || 'Dubaï').trim(),
    created_at: now.toISOString(),
    date: now.toISOString().split('T')[0],
    status: 'pending', // Pending by default for admin moderation
  };

  const updated = [newReview, ...all];
  await saveAllReviewsAsync(updated);
  return newReview;
}

export function addCustomerReview(data: {
  author_name?: string;
  name?: string;
  rating: number;
  service?: string;
  comment?: string;
  review?: string;
  text?: string;
  country?: string;
}): ReviewItem {
  const all = readAllReviews();
  const author = (data.author_name || data.name || 'Visiteur').trim();
  const comment = (data.comment || data.review || data.text || '').trim();
  const now = new Date();

  const newReview: ReviewItem = {
    id: `REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    author_name: author,
    name: author,
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    service: (data.service || 'Service Dubaï').trim(),
    comment,
    text: comment,
    country: (data.country || 'Dubaï').trim(),
    created_at: now.toISOString(),
    date: now.toISOString().split('T')[0],
    status: 'pending',
  };

  const updated = [newReview, ...all];
  saveAllReviews(updated);
  return newReview;
}

export async function updateCustomerReviewAsync(
  id: string,
  updates: Partial<ReviewItem>
): Promise<ReviewItem | null> {
  const all = await readAllReviewsAsync();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const author = updates.author_name || updates.name || all[index].author_name;
  const comment = updates.comment !== undefined ? updates.comment : (updates.text !== undefined ? updates.text : all[index].comment);

  all[index] = {
    ...all[index],
    ...updates,
    author_name: author,
    name: author,
    comment,
    text: comment,
    rating: updates.rating !== undefined ? Math.min(5, Math.max(1, Number(updates.rating))) : all[index].rating,
    service: updates.service !== undefined ? updates.service.trim() : all[index].service,
    country: updates.country !== undefined ? updates.country.trim() : all[index].country,
    status: updates.status || all[index].status,
  };

  await saveAllReviewsAsync(all);
  return all[index];
}

export function updateCustomerReview(
  id: string,
  updates: Partial<ReviewItem>
): ReviewItem | null {
  const all = readAllReviews();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const author = updates.author_name || updates.name || all[index].author_name;
  const comment = updates.comment !== undefined ? updates.comment : (updates.text !== undefined ? updates.text : all[index].comment);

  all[index] = {
    ...all[index],
    ...updates,
    author_name: author,
    name: author,
    comment,
    text: comment,
    rating: updates.rating !== undefined ? Math.min(5, Math.max(1, Number(updates.rating))) : all[index].rating,
    service: updates.service !== undefined ? updates.service.trim() : all[index].service,
    country: updates.country !== undefined ? updates.country.trim() : all[index].country,
    status: updates.status || all[index].status,
  };

  saveAllReviews(all);
  return all[index];
}

export function updateReviewStatus(
  id: string,
  newStatus: 'pending' | 'approved' | 'rejected'
): ReviewItem | null {
  return updateCustomerReview(id, { status: newStatus });
}

export async function deleteCustomerReviewAsync(id: string): Promise<boolean> {
  const all = await readAllReviewsAsync();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return false;

  all.splice(index, 1);
  await saveAllReviewsAsync(all);

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('./prisma');
      await prisma.review.deleteMany({ where: { id } });
    } catch (err) {
      console.warn('Could not delete from prisma.review:', err);
    }
  }

  return true;
}

export function deleteCustomerReview(id: string): boolean {
  const all = readAllReviews();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return false;

  all.splice(index, 1);
  saveAllReviews(all);
  return true;
}
