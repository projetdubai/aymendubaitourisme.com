import { NextRequest, NextResponse } from "next/server";
import { TourismServiceItem, readServicesAsync, writeServicesAsync, DEFAULT_SERVICES } from "@/lib/services";
import { revalidateSite } from "@/lib/revalidate";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const services = await readServicesAsync();
    return NextResponse.json({ success: true, services });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to read services", services: DEFAULT_SERVICES },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentServices = await readServicesAsync();

    const id = body.id || `srv-${Date.now().toString().slice(-4)}`;
    const newService: TourismServiceItem = {
      id,
      slug: body.slug || id,
      title: {
        fr: body.title?.fr || body.title || "Nouveau Service",
        ar: body.title?.ar || body.title_ar || "خدمة جديدة",
        en: body.title?.en || body.title_en || "New Service",
      },
      subtitle: {
        fr: body.subtitle?.fr || body.subtitle || "",
        ar: body.subtitle?.ar || body.subtitle_ar || "",
        en: body.subtitle?.en || body.subtitle_en || "",
      },
      description: {
        fr: body.description?.fr || body.description || "",
        ar: body.description?.ar || body.description_ar || "",
        en: body.description?.en || body.description_en || "",
      },
      iconName: body.iconName || "Sparkles",
      image: body.image || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
      priceStartingFrom: body.priceStartingFrom || "",
      badge: {
        fr: body.badge?.fr || body.badge || "Disponible",
        ar: body.badge?.ar || body.badge_ar || "متاح",
        en: body.badge?.en || body.badge_en || "Available",
      },
      features: {
        fr: Array.isArray(body.features?.fr) ? body.features.fr : ["Prestation haut de gamme", "Accompagnement VIP"],
        ar: Array.isArray(body.features?.ar) ? body.features.ar : ["خدمة راقية ومميزة", "مرافقة ودعم كبار الشخصيات"],
        en: Array.isArray(body.features?.en) ? body.features.en : ["Premium luxury service", "VIP assistance"],
      },
      ctaLink: body.ctaLink || "/quote",
      active: body.active !== undefined ? Boolean(body.active) : true,
      order: Number(body.order) || currentServices.length + 1,
    };

    const updated = [newService, ...currentServices.filter((s) => s.id !== newService.id)];
    await writeServicesAsync(updated);
    await revalidateSite('services');

    return NextResponse.json({ success: true, service: newService, services: updated });
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

    const currentServices = await readServicesAsync();
    const index = currentServices.findIndex((s) => s.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    const existing = currentServices[index];
    const updatedService: TourismServiceItem = {
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
      description: {
        fr: body.description?.fr ?? existing.description?.fr ?? "",
        ar: body.description?.ar ?? existing.description?.ar ?? "",
        en: body.description?.en ?? existing.description?.en ?? "",
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
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
      order: body.order !== undefined ? Number(body.order) : existing.order,
    };

    const updated = [...currentServices];
    updated[index] = updatedService;

    await writeServicesAsync(updated);
    await revalidateSite('services');

    return NextResponse.json({ success: true, service: updatedService, services: updated });
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

    const currentServices = await readServicesAsync();
    const updated = currentServices.filter((s) => s.id !== id);

    await writeServicesAsync(updated);
    await revalidateSite('services');

    return NextResponse.json({ success: true, services: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
