import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { hashPassword } from "@/lib/auth";

const ADMINS_FILE = path.join(process.cwd(), "src", "data", "admins.json");

function readAdmins() {
  try {
    const data = fs.readFileSync(ADMINS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeAdmins(admins: any[]) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
}

export async function GET() {
  try {
    const admins = readAdmins();
    const safeAdmins = admins.map(({ password, passwordHash, ...rest }: any) => rest);
    return NextResponse.json({ success: true, admins: safeAdmins });
  } catch (error) {
    console.error("Error reading admins:", error);
    return NextResponse.json(
      { success: false, message: "Erreur de lecture des administrateurs." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Nom, email et mot de passe sont obligatoires." },
        { status: 400 }
      );
    }

    const admins = readAdmins();
    const exists = admins.some(
      (a: any) => a.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Un administrateur avec cet email existe déjà." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newAdmin = {
      id: `adm_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: passwordHash,
      role: role || "Administrateur",
      createdAt: new Date().toISOString().split("T")[0],
    };

    admins.push(newAdmin);
    writeAdmins(admins);

    const { passwordHash: _, ...safeAdmin } = newAdmin as any;
    return NextResponse.json(
      { success: true, message: "Nouvel administrateur ajouté avec succès !", admin: safeAdmin },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la création de l'administrateur." },
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
        { success: false, message: "ID administrateur manquant." },
        { status: 400 }
      );
    }

    const admins = readAdmins();
    if (admins.length <= 1) {
      return NextResponse.json(
        { success: false, message: "Impossible de supprimer le dernier administrateur." },
        { status: 400 }
      );
    }

    const filtered = admins.filter((a: any) => a.id !== id);
    if (filtered.length === admins.length) {
      return NextResponse.json(
        { success: false, message: "Administrateur non trouvé." },
        { status: 404 }
      );
    }

    writeAdmins(filtered);
    return NextResponse.json({
      success: true,
      message: "Administrateur supprimé avec succès.",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
