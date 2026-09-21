import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
import { z } from "zod";

const quoteSchema = z.object({
  fullName: z.string().min(2),
  country: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email(),
  service: z.string().min(1),
  subService: z.string().optional(),
  propertyType: z.string().optional(),
  propertyCategory: z.string().optional(),
  dubaiArea: z.string().optional(),
  budget: z.string().optional(),
  bedrooms: z.number().optional(),
  rentalDuration: z.string().optional(),
  travelDate: z.string().optional(),
  travelers: z.number().optional(),
  message: z.string().optional(),
  locale: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = quoteSchema.parse(body);

    // When database is connected, uncomment:
    // const quote = await prisma.quoteRequest.create({
    //   data: {
    //     ...validated,
    //     locale: validated.locale || "en",
    //   },
    // });

    // For now, log the request
    console.log("New quote request:", validated);

    return NextResponse.json(
      {
        success: true,
        message: "Quote request submitted successfully",
        // id: quote.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Quote submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
