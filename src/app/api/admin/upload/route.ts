import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloud } from "@/lib/cloud-storage";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Format non supporté. Utilisez JPG, PNG, WEBP ou GIF." },
        { status: 400 }
      );
    }

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file extension
    let ext = "jpg";
    if (file.type === "image/png") ext = "png";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/gif") ext = "gif";
    else if (file.type === "image/svg+xml") ext = "svg";
    else if (file.type === "image/avif") ext = "avif";

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const fileName = `upload-${uniqueSuffix}.${ext}`;

    // Upload using cloud storage (Cloudinary, Vercel Blob, ImgBB, disk, or base64)
    const result = await uploadImageToCloud(buffer, fileName, file.type);

    return NextResponse.json({
      success: true,
      url: result.url,
      name: file.name,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du téléchargement" },
      { status: 500 }
    );
  }
}
