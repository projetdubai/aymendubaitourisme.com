import fs from 'fs';
import path from 'path';
import os from 'os';
import { prisma } from './prisma';

declare global {
  var __cloud_db_cache: Record<string, any> | undefined;
}

if (!globalThis.__cloud_db_cache) {
  globalThis.__cloud_db_cache = {};
}

const TMP_DB_FILE = path.join(os.tmpdir(), 'aymen_cloud_db.json');

// Helper to read local tmp cache
function readTmpDb(): Record<string, any> {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const data = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      return JSON.parse(data) || {};
    }
  } catch (e) {
    // ignore
  }
  return {};
}

// Helper to write local tmp cache
function writeTmpDb(db: Record<string, any>) {
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }
}

/**
 * Maps known entity keys to their project disk source files
 */
export function getDiskFilePath(key: string): string | null {
  if (key === 'site_content') return path.join(process.cwd(), 'src', 'data', 'site-content.json');
  if (key === 'cars') return path.join(process.cwd(), 'src', 'data', 'cars.json');
  if (key === 'visas') return path.join(process.cwd(), 'src', 'data', 'visas.json');
  if (key === 'flights') return path.join(process.cwd(), 'src', 'data', 'flights.json');
  if (key === 'services') return path.join(process.cwd(), 'src', 'data', 'services.json');
  if (key === 'properties') return path.join(process.cwd(), 'src', 'data', 'properties.json');
  if (key === 'reviews') return path.join(process.cwd(), 'src', 'data', 'reviews.json');
  if (key === 'admins') return path.join(process.cwd(), 'src', 'data', 'admins.json');
  if (key === 'versions') return path.join(process.cwd(), 'src', 'data', 'versions.json');
  if (key.startsWith('messages_')) {
    const loc = key.replace('messages_', '');
    return path.join(process.cwd(), 'src', 'messages', `${loc}.json`);
  }
  return null;
}

/**
 * Universal Multi-Tier Cloud Database Adapter
 * Primary Source of Truth: PostgreSQL Supabase via Prisma (SiteSetting model)
 */
export const cloudDb = {
  /**
   * Invalidate all in-memory caches across modules
   */
  invalidate(key?: string) {
    const g = globalThis as any;
    if (key) {
      if (g.__cloud_db_cache) delete g.__cloud_db_cache[key];
      if (key.startsWith('messages_')) {
        const loc = key.replace('messages_', '');
        if (g.__messages_cache) delete g.__messages_cache[loc];
      }
      if (key === 'site_content') {
        g.__content_cache = null;
        g.__site_content_cache = null;
      }
      if (key === 'cars') g.__cars_cache = undefined;
      if (key === 'visas') g.__visas_cache = undefined;
      if (key === 'flights') g.__flights_cache = undefined;
      if (key === 'services') g.__services_cache = undefined;
      if (key === 'properties') g.__properties_cache = undefined;
      if (key === 'reviews') g.__reviews_cache = undefined;
      if (key === 'admins') g.__admins_cache = undefined;
      if (key === 'versions') g.__versions_cache = undefined;
    } else {
      g.__cloud_db_cache = {};
      g.__messages_cache = {};
      g.__content_cache = null;
      g.__site_content_cache = null;
      g.__cars_cache = undefined;
      g.__properties_cache = undefined;
      g.__visas_cache = undefined;
      g.__flights_cache = undefined;
      g.__services_cache = undefined;
      g.__reviews_cache = undefined;
      g.__admins_cache = undefined;
      g.__versions_cache = undefined;
      try {
        if (fs.existsSync(TMP_DB_FILE)) {
          fs.unlinkSync(TMP_DB_FILE);
        }
      } catch {}
    }
  },

  /**
   * Get an item by key from the cloud database
   * Always reads directly from PostgreSQL (Prisma SiteSetting) when DATABASE_URL is set!
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    // 1. Primary Source of Truth: PostgreSQL via Prisma SiteSetting
    if (process.env.DATABASE_URL) {
      try {
        const record = await (prisma as any).siteSetting.findUnique({
          where: { key },
        }).catch(async (findErr: any) => {
          // Fallback to raw query if table has casing nuance
          const rawRows = await prisma.$queryRawUnsafe<any[]>(
            `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1;`,
            key
          ).catch(() => null);
          if (rawRows && rawRows.length > 0) {
            return rawRows[0];
          }
          return null;
        });

        if (record && record.value !== null && record.value !== undefined) {
          let val = record.value;
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {}
          }
          return val as T;
        }
      } catch (prismaErr) {
        console.warn(`[cloudDb] PostgreSQL read error for "${key}":`, prismaErr);
      }
    }

    // 2. Try Upstash / Vercel KV REST API
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
      try {
        const res = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${kvToken}` },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.result !== null && data.result !== undefined) {
            let parsed = data.result;
            if (typeof parsed === 'string') {
              try { parsed = JSON.parse(parsed); } catch {}
            }
            return parsed as T;
          }
        }
      } catch (err) {
        console.warn(`[cloudDb] KV read error for key "${key}":`, err);
      }
    }

    // 3. Try Supabase REST API if configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/SiteSetting?key=eq.${encodeURIComponent(key)}&select=value`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0 && rows[0]?.value !== undefined) {
            let val = rows[0].value;
            if (typeof val === 'string') {
              try { val = JSON.parse(val); } catch {}
            }
            return val as T;
          }
        }
      } catch {}
    }

    // 4. Check project filesystem baseline
    const diskPath = getDiskFilePath(key);
    if (diskPath) {
      try {
        if (fs.existsSync(diskPath)) {
          const raw = fs.readFileSync(diskPath, 'utf-8');
          const parsed = JSON.parse(raw);

          // If DATABASE_URL is set, auto-seed PostgreSQL so subsequent reads hit the DB directly
          if (process.env.DATABASE_URL) {
            (prisma as any).siteSetting.upsert({
              where: { key },
              update: {},
              create: { key, value: parsed },
            }).catch(() => {
              // Fallback raw upsert if needed
              prisma.$executeRawUnsafe(
                `INSERT INTO "SiteSetting" (key, value, "updatedAt")
                 VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
                 ON CONFLICT (key) DO NOTHING;`,
                key,
                JSON.stringify(parsed)
              ).catch(() => null);
            });
          }

          return parsed as T;
        }
      } catch (diskErr) {
        console.warn(`[cloudDb] Disk read error for "${key}":`, diskErr);
      }
    }

    // 5. Check local tmp directory
    const tmpDb = readTmpDb();
    if (tmpDb[key] !== undefined) {
      return tmpDb[key] as T;
    }

    return (defaultValue !== undefined ? defaultValue : null) as T;
  },

  /**
   * Set an item by key in the cloud database (persisted directly to PostgreSQL Supabase)
   */
  async set<T = any>(key: string, value: T): Promise<boolean> {
    // 1. Primary Target: PostgreSQL Supabase via Prisma SiteSetting
    if (process.env.DATABASE_URL) {
      try {
        await (prisma as any).siteSetting.upsert({
          where: { key },
          update: { value: value as any, updatedAt: new Date() },
          create: { key, value: value as any },
        }).catch(async (upsertErr: any) => {
          // Fallback raw query if needed
          const jsonString = JSON.stringify(value);
          await prisma.$executeRawUnsafe(
            `INSERT INTO "SiteSetting" (key, value, "updatedAt")
             VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
             ON CONFLICT (key) DO UPDATE
             SET value = EXCLUDED.value, "updatedAt" = CURRENT_TIMESTAMP;`,
            key,
            jsonString
          );
        });
      } catch (prismaErr) {
        console.warn(`[cloudDb] PostgreSQL write error for key "${key}":`, prismaErr);
      }
    }

    // 2. Try Upstash / Vercel KV REST API
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
      try {
        await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(typeof value === 'string' ? value : JSON.stringify(value)),
        });
      } catch (err) {
        console.warn(`[cloudDb] KV write error for key "${key}":`, err);
      }
    }

    // 3. Try Supabase REST API
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/SiteSetting`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            key,
            value,
            updatedAt: new Date().toISOString(),
          }),
        });
      } catch {}
    }

    // 4. Always store in tmp file for fast local recovery
    const tmpDb = readTmpDb();
    tmpDb[key] = value;
    writeTmpDb(tmpDb);

    // 5. Also try writing to local disk (if filesystem is writable in local dev or VPS)
    const diskPath = getDiskFilePath(key);
    if (diskPath) {
      try {
        const dir = path.dirname(diskPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(diskPath, JSON.stringify(value, null, 2), 'utf-8');
      } catch {}
    }

    // 6. Invalidate runtime caches
    this.invalidate(key);

    return true;
  },

  /**
   * Synchronous getter from project disk files or tmp
   */
  getSync<T = any>(key: string, defaultValue?: T): T {
    const diskPath = getDiskFilePath(key);
    if (diskPath) {
      try {
        if (fs.existsSync(diskPath)) {
          const parsed = JSON.parse(fs.readFileSync(diskPath, 'utf-8'));
          return parsed as T;
        }
      } catch {}
    }

    const tmpDb = readTmpDb();
    if (tmpDb[key] !== undefined) {
      return tmpDb[key] as T;
    }
    return (defaultValue !== undefined ? defaultValue : null) as T;
  },
};
