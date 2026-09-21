import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import os from "os";
import { cloudDb } from "@/lib/cloud-db";
import { revalidateSite } from "@/lib/revalidate";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const MESSAGES_DIR = path.join(process.cwd(), "src", "messages");
const CONTENT_FILE = path.join(process.cwd(), "src", "data", "site-content.json");
const TMP_CONTENT_FILE = path.join(os.tmpdir(), "aymen_site_content.json");

function getDiskMessages(locale: string) {
  try {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`Could not read messages for ${locale}:`, err);
  }
  return {};
}

function getDiskContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = fs.readFileSync(CONTENT_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read primary content file:", err);
  }

  try {
    if (fs.existsSync(TMP_CONTENT_FILE)) {
      const data = fs.readFileSync(TMP_CONTENT_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read tmp content file:", err);
  }

  return {};
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "fr";

    // Read from cloud DB with disk fallback
    const diskMsgs = getDiskMessages(locale);
    const diskContent = getDiskContent();

    const messages = await cloudDb.get(`messages_${locale}`, diskMsgs);
    const content = await cloudDb.get("site_content", diskContent);

    return NextResponse.json({
      success: true,
      locale,
      messages: messages || diskMsgs,
      content: content || diskContent,
    });
  } catch (error) {
    console.error("Error reading site editor data:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la lecture des données du site." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale = "fr", messages, content } = body;

    if (messages) {
      // Save in cloud DB (Upstash KV, PostgreSQL, Supabase, tmp and disk)
      await cloudDb.set(`messages_${locale}`, messages);
    }

    if (content) {
      await cloudDb.set("site_content", content);

      // Sync copyright across all locales if set
      if (content.general?.copyright) {
        for (const loc of ["fr", "ar", "en"]) {
          const locMsgs =
            loc === locale && messages
              ? messages
              : await cloudDb.get(`messages_${loc}`, getDiskMessages(loc));
          if (locMsgs && locMsgs.Footer) {
            locMsgs.Footer.copyright = content.general.copyright;
            await cloudDb.set(`messages_${loc}`, locMsgs);
          }
        }
      }
    }

    // Invalidate caches so visitors and serverless instances immediately see the updated content
    await revalidateSite();
    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({
      success: true,
      message: `Toutes les modifications pour la langue (${locale.toUpperCase()}) ont été enregistrées dans le Cloud et publiées en direct !`,
    });
  } catch (error: any) {
    console.error("Error saving site editor data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Erreur lors de l'enregistrement des modifications." },
      { status: 500 }
    );
  }
}
