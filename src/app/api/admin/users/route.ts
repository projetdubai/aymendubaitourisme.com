import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { hashPassword } from "@/lib/auth";
import { cloudDb } from "@/lib/cloud-db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ADMINS_FILE = path.join(process.cwd(), "src", "data", "admins.json");

function readAdminsDisk() {
  try {
    if (fs.existsSync(ADMINS_FILE)) {
      const data = fs.readFileSync(ADMINS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return [];
}

async function getAdmins(): Promise<any[]> {
  const disk = readAdminsDisk();
  const cloud = await cloudDb.get<any[]>("admins", disk);
  if (Array.isArray(cloud) && cloud.length > 0) {
    return cloud;
  }
  return disk;
}

async function saveAdmins(admins: any[]): Promise<void> {
  await cloudDb.set("admins", admins);
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  try {
    const admins = await getAdmins();
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

    const admins = await getAdmins();
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

    const updatedAdmins = [...admins, newAdmin];
    await saveAdmins(updatedAdmins);

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

    const admins = await getAdmins();
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

    await saveAdmins(filtered);
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
