import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { 
  PropertyItem, 
  readPropertiesAsync, 
  writePropertiesAsync, 
  DEFAULT_PROPERTIES 
} from "@/lib/properties";
import { revalidateSite } from "@/lib/revalidate";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const properties = await readPropertiesAsync();
    return NextResponse.json({ success: true, properties });
  } catch (error) {
    console.error("Error reading properties:", error);
    return NextResponse.json(
      { success: false, message: "Erreur de lecture des propriétés.", properties: DEFAULT_PROPERTIES },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const properties = await readPropertiesAsync();

    const newProperty: PropertyItem = {
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

    const updated = [newProperty, ...properties.filter((p) => p.id !== newProperty.id)];
    await writePropertiesAsync(updated);
    await revalidateSite('properties');
    try { revalidatePath('/', 'layout'); } catch {}

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

    const properties = await readPropertiesAsync();
    const index = properties.findIndex((p) => p.id === body.id);

    if (index === -1) {
      const newProperty: PropertyItem = {
        ...body,
        id: body.id,
      };
      const updated = [newProperty, ...properties];
      await writePropertiesAsync(updated);
      await revalidateSite('properties');
      try { revalidatePath('/', 'layout'); } catch {}

      return NextResponse.json({
        success: true,
        message: "Bien immobilier enregistré avec succès !",
        property: newProperty,
      });
    }

    properties[index] = { ...properties[index], ...body };
    await writePropertiesAsync(properties);
    await revalidateSite('properties');
    try { revalidatePath('/', 'layout'); } catch {}

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

    const properties = await readPropertiesAsync();
    const filtered = properties.filter((p) => p.id !== id);
    await writePropertiesAsync(filtered);

    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/prisma');
        await prisma.property.deleteMany({ where: { id } });
      } catch (err) {
        console.warn('Could not delete from prisma.property:', err);
      }
    }

    await revalidateSite('properties');
    try { revalidatePath('/', 'layout'); } catch {}

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
