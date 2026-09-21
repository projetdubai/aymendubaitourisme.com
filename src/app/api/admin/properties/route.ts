import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function revalidatePropertiesPaths() {
  try {
    revalidatePath("/", "layout");
    for (const loc of ["fr", "ar", "en"]) {
      revalidatePath(`/${loc}`, "layout");
      revalidatePath(`/${loc}`, "page");
      revalidatePath(`/${loc}/real-estate`, "page");
    }
  } catch (e) {
    console.warn("revalidatePropertiesPaths error:", e);
  }
}

const DEFAULT_PROPERTIES = [
  {
    id: "P-101",
    title: "Villa de Prestige Palm Jumeirah",
    location: "Palm Jumeirah",
    type: "Villa",
    category: "Vente",
    price: "15,000,000 AED",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
    bedrooms: 5,
    bathrooms: 6,
    area: "7,500 sqft",
    status: "Active",
  },
  {
    id: "P-102",
    title: "Appartement de Luxe Downtown",
    location: "Downtown Dubai",
    type: "Appartement",
    category: "Location",
    price: "120,000 AED/an",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,450 sqft",
    status: "Active",
  },
  {
    id: "P-103",
    title: "Penthouse Panoramique Dubai Marina",
    location: "Dubai Marina",
    type: "Penthouse",
    category: "Vente",
    price: "8,500,000 AED",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c0?q=80&w=800&auto=format&fit=crop",
    bedrooms: 4,
    bathrooms: 5,
    area: "4,200 sqft",
    status: "Active",
  },
  {
    id: "P-104",
    title: "Bureaux d'Affaires Business Bay",
    location: "Business Bay",
    type: "Bureau",
    category: "Location",
    price: "250,000 AED/an",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
    bedrooms: 0,
    bathrooms: 2,
    area: "2,800 sqft",
    status: "Active",
  },
];

// Global in-memory cache to ensure instant reactivity and survive read-only filesystems
declare global {
  var __properties_cache: any[] | undefined;
}

const PRIMARY_FILE = path.join(process.cwd(), "src", "data", "properties.json");
const TMP_FILE = path.join(os.tmpdir(), "aymen_properties.json");

function getStorageFile(): string {
  try {
    const dir = path.dirname(PRIMARY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Test write permission
    fs.accessSync(dir, fs.constants.W_OK);
    return PRIMARY_FILE;
  } catch {
    return TMP_FILE;
  }
}

function readProperties(): any[] {
  if (globalThis.__properties_cache && globalThis.__properties_cache.length > 0) {
    return globalThis.__properties_cache;
  }

  // 1. Try reading primary file
  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__properties_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read primary properties file, trying tmp:", err);
  }

  // 2. Try reading tmp file
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__properties_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read tmp properties file:", err);
  }

  // 3. Fallback to defaults
  globalThis.__properties_cache = [...DEFAULT_PROPERTIES];
  return globalThis.__properties_cache;
}

function writeProperties(properties: any[]) {
  globalThis.__properties_cache = properties;

  // Try writing to primary file first
  let primarySuccess = false;
  try {
    const dir = path.dirname(PRIMARY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, JSON.stringify(properties, null, 2), "utf-8");
    primarySuccess = true;
  } catch (err) {
    console.warn("Primary file write failed (possibly read-only filesystem):", err);
  }

  // Also write to tmp file as backup
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(properties, null, 2), "utf-8");
  } catch (err) {
    if (!primarySuccess) {
      console.warn("Tmp file write also failed, stored in memory cache:", err);
    }
  }
}

export async function GET() {
  try {
    const properties = readProperties();
    return NextResponse.json({ success: true, properties });
  } catch (error) {
    console.error("Error reading properties:", error);
    return NextResponse.json(
      { success: false, message: "Erreur de lecture des propriétés." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const properties = readProperties();

    const newProperty = {
      id: body.id || `P-${Date.now().toString().slice(-4)}`,
      title: body.title || "Nouveau bien",
      location: body.location || "Dubaï",
      type: body.type || "Appartement",
      category: body.category || "Vente",
      price: body.price || "Sur demande",
      image: body.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
      bedrooms: Number(body.bedrooms) || 1,
      bathrooms: Number(body.bathrooms) || 1,
      area: body.area || "1,000 sqft",
      status: body.status || "Active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newProperty, ...properties];
    writeProperties(updated);
    revalidatePropertiesPaths();

    return NextResponse.json(
      { success: true, message: "Bien immobilier ajouté avec succès !", property: newProperty },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding property:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Erreur lors de l'ajout." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, message: "Identifiant du bien manquant." },
        { status: 400 }
      );
    }

    const properties = readProperties();
    const index = properties.findIndex((p: any) => p.id === body.id);

    if (index === -1) {
      // If not found, add it or update first matching item
      const newProperty = {
        ...body,
        id: body.id,
      };
      const updated = [newProperty, ...properties];
      writeProperties(updated);
      revalidatePropertiesPaths();

      return NextResponse.json({
        success: true,
        message: "Bien immobilier enregistré avec succès !",
        property: newProperty,
      });
    }

    properties[index] = { ...properties[index], ...body };
    writeProperties(properties);
    revalidatePropertiesPaths();

    return NextResponse.json({
      success: true,
      message: "Bien immobilier modifié avec succès !",
      property: properties[index],
    });
  } catch (error: any) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Erreur lors de la mise à jour." },
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

    const properties = readProperties();
    const filtered = properties.filter((p: any) => p.id !== id);
    writeProperties(filtered);
    revalidatePropertiesPaths();

    return NextResponse.json({
      success: true,
      message: "Bien immobilier supprimé avec succès.",
    });
  } catch (error: any) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
