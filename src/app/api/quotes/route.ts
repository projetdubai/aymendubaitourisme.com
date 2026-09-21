import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cloudDb } from "@/lib/cloud-db";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = 'force-dynamic';

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

const PRIMARY_FILE = path.join(process.cwd(), "src", "data", "quotes.json");
const TMP_FILE = path.join(os.tmpdir(), "aymen_quotes.json");

function getInitialQuotes(): any[] {
  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      return JSON.parse(fs.readFileSync(PRIMARY_FILE, "utf-8")) || [];
    }
  } catch {}
  try {
    if (fs.existsSync(TMP_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_FILE, "utf-8")) || [];
    }
  } catch {}
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = quoteSchema.parse(body);

    const newQuote = {
      id: `QT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      ...validated,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };

    // 1. Try PostgreSQL via Prisma if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      try {
        await prisma.quoteRequest.create({
          data: {
            service: validated.service,
            subService: validated.subService || null,
            fullName: validated.fullName,
            country: validated.country,
            phone: validated.phone,
            email: validated.email,
            propertyType: validated.propertyType || null,
            propertyCategory: validated.propertyCategory || null,
            dubaiArea: validated.dubaiArea || null,
            budget: validated.budget || null,
            bedrooms: validated.bedrooms || null,
            rentalDuration: validated.rentalDuration || null,
            travelDate: validated.travelDate || null,
            travelers: validated.travelers || null,
            message: validated.message || null,
            locale: validated.locale || "en",
          },
        });
      } catch (prismaErr) {
        console.warn("[quotes] Prisma save notice:", prismaErr);
      }
    }

    // 2. Persist in cloudDb
    const currentQuotes = (await cloudDb.get<any[]>("quotes")) || getInitialQuotes();
    const updatedQuotes = [newQuote, ...(Array.isArray(currentQuotes) ? currentQuotes : [])];
    await cloudDb.set("quotes", updatedQuotes);

    // 3. Backup to local disk / tmp
    try {
      fs.writeFileSync(TMP_FILE, JSON.stringify(updatedQuotes, null, 2), "utf-8");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: "Quote request submitted successfully",
        id: newQuote.id,
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
