import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { VisaItem, readVisasAsync, writeVisasAsync, DEFAULT_VISAS } from "@/lib/visas";
import { revalidateSite } from "@/lib/revalidate";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


export async function GET() {
  try {
    const visas = await readVisasAsync();
    return NextResponse.json({ success: true, visas });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to read visas", visas: DEFAULT_VISAS },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentVisas = await readVisasAsync();

    const id = body.id || `visa-${Date.now().toString().slice(-4)}`;
    const newVisa: VisaItem = {
      id,
      slug: body.slug || id,
      title: {
        fr: body.title?.fr || body.title || "Nouveau Visa Dubaï",
        ar: body.title?.ar || body.title_ar || "تأشيرة دبي جديدة",
        en: body.title?.en || body.title_en || "New Dubai Visa",
      },
      subtitle: {
        fr: body.subtitle?.fr || body.subtitle || "",
        ar: body.subtitle?.ar || body.subtitle_ar || "",
        en: body.subtitle?.en || body.subtitle_en || "",
      },
      category: body.category || "dubai",
      duration: body.duration || "30 Jours",
      price: body.price || "450 AED",
      processingTime: body.processingTime || "24h - 48h",
      badge: {
        fr: body.badge?.fr || body.badge || "Disponible",
        ar: body.badge?.ar || body.badge_ar || "متاح",
        en: body.badge?.en || body.badge_en || "Available",
      },
      features: {
        fr: Array.isArray(body.features?.fr) ? body.features.fr : Array.isArray(body.features) ? body.features : ["Validité 60 jours", "Assurance incluse"],
        ar: Array.isArray(body.features?.ar) ? body.features.ar : ["صلاحية 60 يوماً", "تأمين معتمد"],
        en: Array.isArray(body.features?.en) ? body.features.en : ["60-day validity", "Insurance included"],
      },
      requirements: {
        fr: Array.isArray(body.requirements?.fr) ? body.requirements.fr : ["Copie du passeport", "Photo d’identité"],
        ar: Array.isArray(body.requirements?.ar) ? body.requirements.ar : ["صورة جواز السفر", "صورة شخصية"],
        en: Array.isArray(body.requirements?.en) ? body.requirements.en : ["Passport copy", "Personal photo"],
      },
      image: body.image || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
      active: body.active !== undefined ? Boolean(body.active) : true,
      order: Number(body.order) || currentVisas.length + 1,
    };

    const updated = [newVisa, ...currentVisas.filter((v) => v.id !== newVisa.id)];
    await writeVisasAsync(updated);
    await revalidateSite('visas');
    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({ success: true, visa: newVisa, visas: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const currentVisas = await readVisasAsync();
    const index = currentVisas.findIndex((v) => v.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Visa not found" }, { status: 404 });
    }

    const existing = currentVisas[index];
    const updatedVisa: VisaItem = {
      ...existing,
      ...body,
      title: {
        fr: body.title?.fr ?? existing.title?.fr ?? "",
        ar: body.title?.ar ?? existing.title?.ar ?? "",
        en: body.title?.en ?? existing.title?.en ?? "",
      },
      subtitle: {
        fr: body.subtitle?.fr ?? existing.subtitle?.fr ?? "",
        ar: body.subtitle?.ar ?? existing.subtitle?.ar ?? "",
        en: body.subtitle?.en ?? existing.subtitle?.en ?? "",
      },
      badge: {
        fr: body.badge?.fr ?? existing.badge?.fr ?? "",
        ar: body.badge?.ar ?? existing.badge?.ar ?? "",
        en: body.badge?.en ?? existing.badge?.en ?? "",
      },
      features: {
        fr: body.features?.fr ?? existing.features?.fr ?? [],
        ar: body.features?.ar ?? existing.features?.ar ?? [],
        en: body.features?.en ?? existing.features?.en ?? [],
      },
      requirements: {
        fr: body.requirements?.fr ?? existing.requirements?.fr ?? [],
        ar: body.requirements?.ar ?? existing.requirements?.ar ?? [],
        en: body.requirements?.en ?? existing.requirements?.en ?? [],
      },
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
      order: body.order !== undefined ? Number(body.order) : existing.order,
    };

    const updated = [...currentVisas];
    updated[index] = updatedVisa;

    await writeVisasAsync(updated);
    await revalidateSite('visas');
    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({ success: true, visa: updatedVisa, visas: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const currentVisas = await readVisasAsync();
    const updated = currentVisas.filter((v) => v.id !== id);

    await writeVisasAsync(updated);
    await revalidateSite('visas');
    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({ success: true, visas: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
