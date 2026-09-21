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
 * Universal Multi-Tier Cloud Database Adapter
 * 1. Upstash Redis / Vercel KV (Fastest, zero-config on Vercel)
 * 2. PostgreSQL (Prisma / Supabase / Neon)
 * 3. Supabase REST API
 * 4. Project Source Filesystem (src/data, src/messages)
 * 5. os.tmpdir() fallback
 * 6. globalThis in-memory caching
 */
export const cloudDb = {
  /**
   * Invalidate all in-memory and page caches so visitors immediately see new updates
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
      if (key === 'cars') {
        g.__cars_cache = undefined;
      }
      if (key === 'visas') {
        g.__visas_cache = undefined;
      }
      if (key === 'flights') {
        g.__flights_cache = undefined;
      }
      if (key === 'services') {
        g.__services_cache = undefined;
      }
      if (key === 'reviews') {
        g.__reviews_cache = undefined;
      }
    } else {
      // Invalidate everything
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
      try {
        if (fs.existsSync(TMP_DB_FILE)) {
          fs.unlinkSync(TMP_DB_FILE);
        }
      } catch {}
    }
  },

  /**
   * Get an item by key from the cloud database
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    // 1. Check in-memory cache first for sub-millisecond response
    if (globalThis.__cloud_db_cache && globalThis.__cloud_db_cache[key] !== undefined) {
      return globalThis.__cloud_db_cache[key] as T;
    }

    // 2. Try Upstash / Vercel KV
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
              try {
                parsed = JSON.parse(parsed);
              } catch {}
            }
            globalThis.__cloud_db_cache![key] = parsed;
            return parsed as T;
          }
        }
      } catch (err) {
        console.warn(`[cloudDb] KV read error for key "${key}":`, err);
      }
    }

    // 3. Try PostgreSQL via Prisma if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        const records = await prisma.$queryRawUnsafe<any[]>(
          `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1;`,
          key
        ).catch(() => null);

        if (records && records.length > 0 && records[0]?.value !== undefined) {
          const val = records[0].value;
          globalThis.__cloud_db_cache![key] = val;
          return val as T;
        }
      } catch (prismaErr) {
        // Table might not exist yet; will be created on first write
      }
    }

    // 4. Try Supabase REST API if SUPABASE_URL is configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}&select=value`,
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
            const val = rows[0].value;
            globalThis.__cloud_db_cache![key] = val;
            return val as T;
          }
        }
      } catch (sbErr) {
        console.warn(`[cloudDb] Supabase read error for key "${key}":`, sbErr);
      }
    }

    // 5. Check project filesystem FIRST (real source of truth on disk)
    if (key === 'site_content') {
      try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'site-content.json');
        if (fs.existsSync(filePath)) {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          globalThis.__cloud_db_cache![key] = parsed;
          return parsed as T;
        }
      } catch {}
    } else if (key.startsWith('messages_')) {
      const loc = key.replace('messages_', '');
      try {
        const filePath = path.join(process.cwd(), 'src', 'messages', `${loc}.json`);
        if (fs.existsSync(filePath)) {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          globalThis.__cloud_db_cache![key] = parsed;
          return parsed as T;
        }
      } catch {}
    } else if (key === 'cars') {
      try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'cars.json');
        if (fs.existsSync(filePath)) {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          globalThis.__cloud_db_cache![key] = parsed;
          return parsed as T;
        }
      } catch {}
    } else if (key === 'reviews') {
      try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'reviews.json');
        if (fs.existsSync(filePath)) {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          globalThis.__cloud_db_cache![key] = parsed;
          return parsed as T;
        }
      } catch {}
    }

    // 6. Check local tmp directory only if disk file is missing or in serverless tmp
    const tmpDb = readTmpDb();
    if (tmpDb[key] !== undefined) {
      globalThis.__cloud_db_cache![key] = tmpDb[key];
      return tmpDb[key] as T;
    }

    return (defaultValue !== undefined ? defaultValue : null) as T;
  },

  /**
   * Set an item by key in the cloud database
   */
  async set<T = any>(key: string, value: T): Promise<boolean> {
    // 1. Immediately store in memory cache
    globalThis.__cloud_db_cache![key] = value;

    // Cross-sync global caches across modules
    const g = globalThis as any;
    if (key.startsWith('messages_')) {
      const loc = key.replace('messages_', '');
      if (!g.__messages_cache) g.__messages_cache = {};
      g.__messages_cache[loc] = value;
    } else if (key === 'site_content') {
      g.__content_cache = value;
      g.__site_content_cache = value;
    } else if (key === 'cars') {
      g.__cars_cache = Array.isArray(value) ? [...value] : value;
    } else if (key === 'reviews') {
      g.__reviews_cache = Array.isArray(value) ? [...value] : value;
    }

    // 2. Always store in tmp file for fast local recovery
    const tmpDb = readTmpDb();
    tmpDb[key] = value;
    writeTmpDb(tmpDb);

    let cloudPersisted = false;

    // 3. Try Upstash / Vercel KV REST API
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
      try {
        const res = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(typeof value === 'string' ? value : JSON.stringify(value)),
        });
        if (res.ok) {
          cloudPersisted = true;
        }
      } catch (err) {
        console.warn(`[cloudDb] KV write error for key "${key}":`, err);
      }
    }

    // 4. Try PostgreSQL via Prisma
    if (process.env.DATABASE_URL) {
      try {
        // Auto-create table if not existing
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "SiteSetting" (
            key TEXT PRIMARY KEY,
            value JSONB,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `).catch(() => null);

        // Upsert setting
        const jsonString = JSON.stringify(value);
        await prisma.$executeRawUnsafe(
          `
          INSERT INTO "SiteSetting" (key, value, "updatedAt")
          VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE
          SET value = EXCLUDED.value, "updatedAt" = CURRENT_TIMESTAMP;
        `,
          key,
          jsonString
        );
        cloudPersisted = true;
      } catch (prismaErr) {
        console.warn(`[cloudDb] Prisma write error for key "${key}":`, prismaErr);
      }
    }

    // 5. Try Supabase REST API
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
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
            updated_at: new Date().toISOString(),
          }),
        });
        if (res.ok) {
          cloudPersisted = true;
        }
      } catch (sbErr) {
        console.warn(`[cloudDb] Supabase write error for key "${key}":`, sbErr);
      }
    }

    // 6. Also try writing to local disk (if filesystem is writable in dev or VPS)
    try {
      if (key === 'site_content') {
        const filePath = path.join(process.cwd(), 'src', 'data', 'site-content.json');
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
      } else if (key.startsWith('messages_')) {
        const loc = key.replace('messages_', '');
        const filePath = path.join(process.cwd(), 'src', 'messages', `${loc}.json`);
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
      } else if (key === 'cars') {
        const filePath = path.join(process.cwd(), 'src', 'data', 'cars.json');
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
      } else if (key === 'reviews') {
        const filePath = path.join(process.cwd(), 'src', 'data', 'reviews.json');
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
      }
    } catch {}

    return true;
  },

  /**
   * Synchronous getter from in-memory cache or project disk files
   */
  getSync<T = any>(key: string, defaultValue?: T): T {
    if (globalThis.__cloud_db_cache && globalThis.__cloud_db_cache[key] !== undefined) {
      return globalThis.__cloud_db_cache[key] as T;
    }

    // Check project filesystem first
    if (key === 'site_content') {
      try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'site-content.json');
        if (fs.existsSync(filePath)) {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          globalThis.__cloud_db_cache![key] = parsed;
          return parsed as T;
        }
      } catch {}
    } else if (key.startsWith('messages_')) {
      const loc = key.replace('messages_', '');
      try {
        const filePath = path.join(process.cwd(), 'src', 'messages', `${loc}.json`);
        if (fs.existsSync(filePath)) {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          globalThis.__cloud_db_cache![key] = parsed;
          return parsed as T;
        }
      } catch {}
    } else if (key === 'cars') {
      try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'cars.json');
        if (fs.existsSync(filePath)) {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          globalThis.__cloud_db_cache![key] = parsed;
          return parsed as T;
        }
      } catch {}
    } else if (key === 'reviews') {
      try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'reviews.json');
        if (fs.existsSync(filePath)) {
          const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          globalThis.__cloud_db_cache![key] = parsed;
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

