import { NextRequest, NextResponse } from "next/server";
import { CarItem, readCarsAsync, writeCarsAsync, DEFAULT_CARS } from "@/lib/cars";
import { revalidateSite } from "@/lib/revalidate";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cars = await readCarsAsync();
    return NextResponse.json({ success: true, cars });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to read cars", cars: DEFAULT_CARS },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentCars = await readCarsAsync();
    
    let parsedImages: string[] = [];
    if (Array.isArray(body.images) && body.images.length > 0) {
      parsedImages = body.images;
    } else if (body.image) {
      parsedImages = [body.image];
    } else {
      parsedImages = ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"];
    }

    const newCar: CarItem = {
      id: body.id || `CAR-${Date.now().toString().slice(-4)}`,
      name: body.name || "Nouveau Véhicule",
      brand: body.brand || "Marque",
      category: body.category || "Supercars & Sportives",
      pricePerDay: body.pricePerDay || "1,000 AED",
      pricePerWeek: body.pricePerWeek || "",
      pricePerMonth: body.pricePerMonth || "",
      image: parsedImages[0],
      images: parsedImages,
      transmission: body.transmission || "Automatique",
      seats: Number(body.seats) || 5,
      engine: body.engine || "Essence",
      features: Array.isArray(body.features)
        ? body.features
        : typeof body.features === "string"
        ? body.features.split(",").map((s: string) => s.trim()).filter(Boolean)
        : ["Assurance incluse", "Livraison aéroport"],
      status: body.status || "Disponible",
      featured: Boolean(body.featured),
    };

    const updated = [newCar, ...currentCars.filter((c) => c.id !== newCar.id)];
    await writeCarsAsync(updated);
    await revalidateSite('cars');

    return NextResponse.json({ success: true, car: newCar });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create car" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Missing car id" }, { status: 400 });
    }

    const currentCars = await readCarsAsync();
    const exists = currentCars.some((c) => c.id === body.id);

    let parsedImages: string[] = [];
    if (Array.isArray(body.images) && body.images.length > 0) {
      parsedImages = body.images;
    } else if (body.image) {
      parsedImages = [body.image];
    } else {
      parsedImages = ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"];
    }

    const updatedCar: CarItem = {
      id: body.id,
      name: body.name || "Véhicule",
      brand: body.brand || "Marque",
      category: body.category || "Supercars & Sportives",
      pricePerDay: body.pricePerDay || "1,000 AED",
      pricePerWeek: body.pricePerWeek || "",
      pricePerMonth: body.pricePerMonth || "",
      image: parsedImages[0],
      images: parsedImages,
      transmission: body.transmission || "Automatique",
      seats: Number(body.seats) || 5,
      engine: body.engine || "Essence",
      features: Array.isArray(body.features)
        ? body.features
        : typeof body.features === "string"
        ? body.features.split(",").map((s: string) => s.trim()).filter(Boolean)
        : ["Assurance incluse"],
      status: body.status || "Disponible",
      featured: Boolean(body.featured),
    };

    let updatedList: CarItem[];
    if (exists) {
      updatedList = currentCars.map((c) => (c.id === body.id ? updatedCar : c));
    } else {
      updatedList = [updatedCar, ...currentCars];
    }

    await writeCarsAsync(updatedList);
    await revalidateSite('cars');

    return NextResponse.json({ success: true, car: updatedCar });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update car" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id parameter" }, { status: 400 });
    }

    const currentCars = await readCarsAsync();
    const updated = currentCars.filter((c) => c.id !== id);
    await writeCarsAsync(updated);
    await revalidateSite('cars');

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete car" },
      { status: 500 }
    );
  }
}
