import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cloudDb } from "@/lib/cloud-db";

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...validated,
      read: false,
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      try {
        await prisma.contactMessage.create({
          data: {
            name: validated.name,
            email: validated.email,
            phone: validated.phone || null,
            message: validated.message,
            read: false,
          },
        });
      } catch (err) {
        console.warn("[contact] Prisma save notice:", err);
      }
    }

    const currentMessages = (await cloudDb.get<any[]>("contact_messages")) || [];
    const updatedMessages = [newMessage, ...(Array.isArray(currentMessages) ? currentMessages : [])];
    await cloudDb.set("contact_messages", updatedMessages);

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully. We will get back to you soon.",
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
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
