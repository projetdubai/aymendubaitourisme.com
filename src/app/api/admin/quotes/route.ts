import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { cloudDb } from "@/lib/cloud-db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

declare global {
  var __quotes_cache: any[] | undefined;
}

const PRIMARY_FILE = path.join(process.cwd(), "src", "data", "quotes.json");
const TMP_FILE = path.join(os.tmpdir(), "aymen_quotes.json");

function readDiskQuotes(): any[] {
  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {}

  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {}

  return [];
}

async function getQuotes(): Promise<any[]> {
  const disk = readDiskQuotes();
  const cloud = await cloudDb.get<any[]>("quotes", disk);
  if (Array.isArray(cloud) && cloud.length > 0) {
    globalThis.__quotes_cache = cloud;
    return cloud;
  }
  globalThis.__quotes_cache = disk;
  return disk;
}

async function saveQuotes(quotes: any[]): Promise<void> {
  globalThis.__quotes_cache = quotes;
  await cloudDb.set("quotes", quotes);

  try {
    const dir = path.dirname(PRIMARY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRIMARY_FILE, JSON.stringify(quotes, null, 2), "utf-8");
  } catch {}

  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(quotes, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  try {
    const quotes = await getQuotes();
    return NextResponse.json({ success: true, quotes });
  } catch (error) {
    console.error("Error reading quotes:", error);
    return NextResponse.json(
      { success: false, message: "Erreur de lecture des devis." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const quotes = await getQuotes();
    const index = quotes.findIndex((q: any) => q.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Devis introuvable." },
        { status: 404 }
      );
    }

    quotes[index].status = status;
    await saveQuotes(quotes);

    return NextResponse.json({
      success: true,
      message: "Statut du devis mis à jour.",
      quote: quotes[index],
    });
  } catch (error) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID manquant." },
        { status: 400 }
      );
    }

    const quotes = await getQuotes();
    const filtered = quotes.filter((q: any) => q.id !== id);
    await saveQuotes(filtered);

    return NextResponse.json({
      success: true,
      message: "Devis supprimé avec succès.",
    });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
