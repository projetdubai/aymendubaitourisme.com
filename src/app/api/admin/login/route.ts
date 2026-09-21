import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { comparePassword, generateToken } from "@/lib/auth";
import { cloudDb } from "@/lib/cloud-db";

const ADMINS_FILE = path.join(process.cwd(), "src", "data", "admins.json");

function readAdmins() {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = fs.readFileSync(ADMINS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Veuillez fournir un email et un mot de passe." },
        { status: 400 }
      );
    }

    const diskAdmins = readAdmins();
    const cloudAdmins = await cloudDb.get<any[]>("admins", diskAdmins);
    const admins = Array.isArray(cloudAdmins) && cloudAdmins.length > 0 ? cloudAdmins : diskAdmins;

    const admin = admins.find(
      (a: any) =>
        a.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.passwordHash || admin.password);
    
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      message: "Connexion réussie",
    });

    response.cookies.set("admin_token", token, {
      path: "/",
      maxAge: 86400 * 7, // 7 days
      httpOnly: true,
      sameSite: "lax",
    });

    response.cookies.set("admin_authenticated", "true", {
      path: "/",
      maxAge: 86400 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la connexion." },
      { status: 500 }
    );
  }
}
