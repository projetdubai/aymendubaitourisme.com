import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FlightItem, readFlightsAsync, writeFlights, DEFAULT_FLIGHTS } from "@/lib/flights";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function revalidateFlightPaths() {
  try {
    revalidatePath("/", "layout");
    for (const loc of ["fr", "ar", "en"]) {
      revalidatePath(`/${loc}`, "layout");
      revalidatePath(`/${loc}`, "page");
      revalidatePath(`/${loc}/flights`, "page");
      revalidatePath(`/${loc}/quote`, "page");
    }
  } catch (e) {
    console.warn("revalidateFlightPaths error:", e);
  }
}

export async function GET() {
  try {
    const flights = await readFlightsAsync();
    return NextResponse.json({ success: true, flights });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to read flights", flights: DEFAULT_FLIGHTS },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentFlights = await readFlightsAsync();

    const id = body.id || `fl-${Date.now().toString().slice(-4)}`;
    const newFlight: FlightItem = {
      id,
      airline: body.airline || "Emirates",
      flightNumber: body.flightNumber || "",
      fromCity: {
        fr: body.fromCity?.fr || body.fromCity || "Départ",
        ar: body.fromCity?.ar || body.fromCity_ar || "مدينة المغادرة",
        en: body.fromCity?.en || body.fromCity_en || "Departure City",
      },
      toCity: {
        fr: body.toCity?.fr || body.toCity || "Dubaï DXB",
        ar: body.toCity?.ar || body.toCity_ar || "دبي (DXB)",
        en: body.toCity?.en || body.toCity_en || "Dubai DXB",
      },
      cabinClass: body.cabinClass || "economy",
      flightType: body.flightType || "direct",
      priceStartingFrom: body.priceStartingFrom || "1,500 AED",
      badge: {
        fr: body.badge?.fr || body.badge || "Vol Direct",
        ar: body.badge?.ar || body.badge_ar || "رحلة مباشرة",
        en: body.badge?.en || body.badge_en || "Direct Flight",
      },
      baggageAllowance: body.baggageAllowance || "2 x 23 kg",
      duration: body.duration || "Direct",
      features: {
        fr: Array.isArray(body.features?.fr) ? body.features.fr : ["Vol direct", "Bagages inclus"],
        ar: Array.isArray(body.features?.ar) ? body.features.ar : ["رحلة مباشرة", "الأمتعة مشمولة"],
        en: Array.isArray(body.features?.en) ? body.features.en : ["Direct flight", "Baggage included"],
      },
      image: body.image || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
      active: body.active !== undefined ? Boolean(body.active) : true,
      order: Number(body.order) || currentFlights.length + 1,
    };

    const updated = [newFlight, ...currentFlights.filter((f) => f.id !== newFlight.id)];
    writeFlights(updated);
    revalidateFlightPaths();

    return NextResponse.json({ success: true, flight: newFlight, flights: updated });
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

    const currentFlights = await readFlightsAsync();
    const index = currentFlights.findIndex((f) => f.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Flight not found" }, { status: 404 });
    }

    const existing = currentFlights[index];
    const updatedFlight: FlightItem = {
      ...existing,
      ...body,
      fromCity: {
        fr: body.fromCity?.fr ?? existing.fromCity?.fr ?? "",
        ar: body.fromCity?.ar ?? existing.fromCity?.ar ?? "",
        en: body.fromCity?.en ?? existing.fromCity?.en ?? "",
      },
      toCity: {
        fr: body.toCity?.fr ?? existing.toCity?.fr ?? "",
        ar: body.toCity?.ar ?? existing.toCity?.ar ?? "",
        en: body.toCity?.en ?? existing.toCity?.en ?? "",
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

    const updated = [...currentFlights];
    updated[index] = updatedFlight;

    writeFlights(updated);
    revalidateFlightPaths();

    return NextResponse.json({ success: true, flight: updatedFlight, flights: updated });
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

    const currentFlights = await readFlightsAsync();
    const updated = currentFlights.filter((f) => f.id !== id);

    writeFlights(updated);
    revalidateFlightPaths();

    return NextResponse.json({ success: true, flights: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
