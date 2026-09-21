import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import os from "os";
import { cloudDb } from "@/lib/cloud-db";

declare global {
  var __site_content_cache: any | undefined;
}

const PRIMARY_FILE = path.join(process.cwd(), "src", "data", "site-content.json");
const TMP_FILE = path.join(os.tmpdir(), "aymen_site_content.json");

function readContent(): any {
  if (globalThis.__site_content_cache) {
    return globalThis.__site_content_cache;
  }

  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, "utf-8");
      const parsed = JSON.parse(data);
      globalThis.__site_content_cache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Could not read primary content file:", err);
  }

  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed = JSON.parse(data);
      globalThis.__site_content_cache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Could not read tmp content file:", err);
  }

  return {};
}

function writeContent(content: any) {
  globalThis.__site_content_cache = content;

  try {
    const dir = path.dirname(PRIMARY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, JSON.stringify(content, null, 2), "utf-8");
  } catch (err) {
    console.warn("Primary content file write failed:", err);
  }

  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(content, null, 2), "utf-8");
  } catch (err) {
    console.warn("Tmp content file write failed:", err);
  }
}

export async function GET() {
  try {
    let content = await cloudDb.get('site_content');
    if (!content || typeof content !== 'object' || Object.keys(content).length === 0) {
      content = readContent();
    }
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Error reading site content:", error);
    return NextResponse.json(
      { success: false, message: "Erreur de lecture du contenu." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const current = readContent() || {};

    const updated = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    writeContent(updated);
    await cloudDb.set("site_content", updated);
    cloudDb.invalidate("site_content");

    try {
      revalidatePath("/", "layout");
      for (const loc of ["fr", "ar", "en"]) {
        revalidatePath(`/${loc}`, "layout");
        revalidatePath(`/${loc}`, "page");
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Modifications enregistrées et publiées avec succès !",
      content: updated,
    });
  } catch (error: any) {
    console.error("Error updating site content:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Erreur lors de l'enregistrement." },
      { status: 500 }
    );
  }
}
