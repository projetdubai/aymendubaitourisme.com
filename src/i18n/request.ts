import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import fs from "fs";
import path from "path";
import os from "os";
import { cloudDb } from "@/lib/cloud-db";

declare global {
  var __messages_cache: Record<string, any> | undefined;
  var __content_cache: any | undefined;
}

if (!globalThis.__messages_cache) {
  globalThis.__messages_cache = {};
}

const MESSAGES_DIR = path.join(process.cwd(), "src", "messages");
const CONTENT_FILE = path.join(process.cwd(), "src", "data", "site-content.json");
const TMP_CONTENT_FILE = path.join(os.tmpdir(), "aymen_site_content.json");

function getLiveSiteContent(): any {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
      globalThis.__content_cache = data;
      return data;
    }
  } catch {}
  if (globalThis.__content_cache) {
    return globalThis.__content_cache;
  }
  try {
    if (fs.existsSync(TMP_CONTENT_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_CONTENT_FILE, "utf-8"));
      globalThis.__content_cache = data;
      return data;
    }
  } catch {}
  return {};
}

function loadFreshMessages(locale: string): Record<string, any> | null {
  // Read directly from disk first
  try {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (!globalThis.__messages_cache) globalThis.__messages_cache = {};
      globalThis.__messages_cache[locale] = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn(`Could not read messages file for locale '${locale}':`, err);
  }

  // Fallback to in-memory cache if disk is read-only or unavailable
  if (globalThis.__messages_cache && globalThis.__messages_cache[locale]) {
    return globalThis.__messages_cache[locale];
  }

  return null;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  // 1. Fetch live messages from cloudDb (Upstash KV, PostgreSQL, memory cache)
  let messages: Record<string, any> | null = await cloudDb.get<Record<string, any> | null>(`messages_${locale}`, null);

  // 2. Fallback to fresh disk read or import
  if (!messages || Object.keys(messages).length === 0) {
    messages = loadFreshMessages(locale);
  }

  if (!messages || Object.keys(messages).length === 0) {
    try {
      messages = (await import(`../messages/${locale}.json`)).default;
    } catch {
      messages = {};
    }
  }

  // 3. Fetch live site-content configuration from cloudDb
  const siteContent = (await cloudDb.get("site_content")) || getLiveSiteContent();

  // Overlay dynamic general content (copyright, contact info, tagline)
  if (siteContent?.general && messages) {
    if (messages.Footer) {
      if (siteContent.general.copyright) {
        messages.Footer.copyright = siteContent.general.copyright;
      }
      if (siteContent.general.phone) {
        messages.Footer.phone = siteContent.general.phone;
      }
      if (siteContent.general.whatsapp) {
        messages.Footer.whatsapp = siteContent.general.whatsapp;
      }
      if (siteContent.general.email) {
        messages.Footer.email = siteContent.general.email;
      }
      if (siteContent.general.address) {
        messages.Footer.address = siteContent.general.address;
      }
    }
    if (messages.Navigation && siteContent.general.whatsapp) {
      messages.Navigation.whatsappNumber = siteContent.general.whatsapp;
    }
    if (messages.Hero) {
      if (siteContent.general.tagline) {
        messages.Hero.badge = siteContent.general.tagline;
      }
      if (siteContent.general.whatsapp) {
        messages.Hero.whatsappNumber = siteContent.general.whatsapp;
      }
    }
  }

  if (siteContent?.socials && messages?.Footer) {
    if (siteContent.socials.instagram) messages.Footer.instagram = siteContent.socials.instagram;
    if (siteContent.socials.tiktok) messages.Footer.tiktok = siteContent.socials.tiktok;
    if (siteContent.socials.snapchat) messages.Footer.snapchat = siteContent.socials.snapchat;
    if (siteContent.socials.facebook) messages.Footer.facebook = siteContent.socials.facebook;
    if (siteContent.socials.youtube) messages.Footer.youtube = siteContent.socials.youtube;
  }

  return {
    locale,
    messages: messages || {},
  };
});
