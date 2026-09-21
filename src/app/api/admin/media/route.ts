import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cloudDb } from '@/lib/cloud-db';
import { uploadImageToCloud } from '@/lib/cloud-storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  folder: string;
  title?: string;
  alt?: string;
  tags?: string[];
  modifiedAt: string;
  createdAt?: string;
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'];

function scanDirectory(dir: string, baseDir: string, mediaList: MediaFile[]) {
  try {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === '_next' || file === 'node_modules' || file.startsWith('.')) continue;

      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, baseDir, mediaList);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          let relativePath = fullPath.substring(baseDir.length).replace(/\\/g, '/');
          if (!relativePath.startsWith('/')) relativePath = '/' + relativePath;

          let folderName = path.dirname(relativePath).replace(/^\//, '');
          if (folderName === '' || folderName === '.') folderName = 'general';

          mediaList.push({
            id: `static-${Buffer.from(relativePath).toString('base64').replace(/=/g, '')}`,
            name: file,
            url: relativePath,
            size: stat.size,
            folder: folderName,
            title: file.replace(/\.[^/.]+$/, ''),
            alt: file.replace(/\.[^/.]+$/, ''),
            modifiedAt: stat.mtime.toISOString(),
            createdAt: stat.birthtime ? stat.birthtime.toISOString() : stat.mtime.toISOString(),
          });
        }
      }
    }
  } catch (e) {
    console.error('Error scanning directory:', dir, e);
  }
}

/**
 * GET /api/admin/media
 * Returns all media files (scanned disk files + dynamic cloud files minus deleted files)
 */
export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const scannedMedia: MediaFile[] = [];

    // 1. Scan public folder if available on disk
    scanDirectory(publicDir, publicDir, scannedMedia);

    // 2. Fetch custom media and deleted URLs from cloudDb
    const customMedia = await cloudDb.get<MediaFile[]>('media_library', []);
    const deletedUrls = new Set(await cloudDb.get<string[]>('media_deleted_urls', []));

    // 3. Filter out deleted static media
    const activeStaticMedia = scannedMedia.filter((m) => !deletedUrls.has(m.url));

    // 4. Merge custom media with static media (custom media takes precedence if URL matches)
    const mediaMap = new Map<string, MediaFile>();

    for (const item of activeStaticMedia) {
      mediaMap.set(item.url, item);
    }

    if (Array.isArray(customMedia)) {
      for (const item of customMedia) {
        if (!deletedUrls.has(item.url)) {
          mediaMap.set(item.url, {
            ...mediaMap.get(item.url),
            ...item,
          });
        }
      }
    }

    const mergedList = Array.from(mediaMap.values()).sort((a, b) => {
      const timeA = new Date(a.modifiedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.modifiedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, media: mergedList });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Erreur lors de la récupération des médias' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/media
 * Add new media via file upload OR direct external URL
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let newMediaItem: MediaFile;

    // Check if multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const customName = (formData.get('name') as string) || '';
      const folder = (formData.get('folder') as string) || 'uploads';
      const title = (formData.get('title') as string) || '';
      const alt = (formData.get('alt') as string) || '';

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Aucun fichier sélectionné' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.jpg';
      const cleanBaseName = (customName || file.name.replace(/\.[^/.]+$/, ''))
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');
      const uniqueName = `${cleanBaseName}-${Date.now().toString().slice(-6)}${ext}`;

      // Upload via cloud storage adapter (Cloudinary / Vercel Blob / disk / base64)
      const uploadResult = await uploadImageToCloud(buffer, uniqueName, file.type);

      newMediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: customName || file.name,
        url: uploadResult.url,
        size: file.size,
        folder,
        title: title || customName || file.name.replace(/\.[^/.]+$/, ''),
        alt: alt || title || customName || file.name.replace(/\.[^/.]+$/, ''),
        modifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    } else {
      // JSON payload (e.g. adding an image by direct URL)
      const body = await req.json();
      const { url, name, folder = 'uploads', title, alt, size = 0 } = body;

      if (!url || typeof url !== 'string' || !url.trim()) {
        return NextResponse.json(
          { success: false, error: "L'URL de l'image est obligatoire" },
          { status: 400 }
        );
      }

      const cleanUrl = url.trim();
      const parsedName = name || cleanUrl.split('/').pop()?.split('?')[0] || 'Image';

      newMediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: parsedName,
        url: cleanUrl,
        size: Number(size) || 0,
        folder: folder || 'uploads',
        title: title || parsedName,
        alt: alt || title || parsedName,
        modifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    }

    // Save into cloudDb
    const currentCustom = await cloudDb.get<MediaFile[]>('media_library', []);
    const updatedCustom = [newMediaItem, ...(Array.isArray(currentCustom) ? currentCustom : [])];
    await cloudDb.set('media_library', updatedCustom);

    // If it was previously marked as deleted, un-delete it
    const currentDeleted = await cloudDb.get<string[]>('media_deleted_urls', []);
    if (Array.isArray(currentDeleted) && currentDeleted.includes(newMediaItem.url)) {
      await cloudDb.set(
        'media_deleted_urls',
        currentDeleted.filter((u) => u !== newMediaItem.url)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Média ajouté avec succès',
      media: newMediaItem,
    });
  } catch (error: any) {
    console.error('Error adding media:', error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erreur lors de l'ajout du média" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/media
 * Edit media metadata (name, folder, title, alt, or replace URL)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, url, name, folder, title, alt, newUrl } = body;

    if (!url && !id) {
      return NextResponse.json(
        { success: false, error: 'Identifiant ou URL du média requis' },
        { status: 400 }
      );
    }

    const currentCustom = (await cloudDb.get<MediaFile[]>('media_library', [])) || [];
    const now = new Date().toISOString();

    let existingIdx = currentCustom.findIndex(
      (m) => (id && m.id === id) || (url && m.url === url)
    );

    let updatedItem: MediaFile;

    if (existingIdx !== -1) {
      updatedItem = {
        ...currentCustom[existingIdx],
        name: name !== undefined ? name : currentCustom[existingIdx].name,
        folder: folder !== undefined ? folder : currentCustom[existingIdx].folder,
        title: title !== undefined ? title : currentCustom[existingIdx].title,
        alt: alt !== undefined ? alt : currentCustom[existingIdx].alt,
        url: newUrl || currentCustom[existingIdx].url,
        modifiedAt: now,
      };
      currentCustom[existingIdx] = updatedItem;
    } else {
      // It was a static scanned item being edited for the first time
      updatedItem = {
        id: id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: name || url.split('/').pop() || 'Image',
        url: newUrl || url,
        size: 0,
        folder: folder || 'general',
        title: title || name || '',
        alt: alt || title || name || '',
        modifiedAt: now,
        createdAt: now,
      };
      currentCustom.unshift(updatedItem);
    }

    await cloudDb.set('media_library', currentCustom);

    return NextResponse.json({
      success: true,
      message: 'Média modifié avec succès',
      media: updatedItem,
    });
  } catch (error: any) {
    console.error('Error editing media:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la modification du média' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/media
 * Delete media item(s) by URL or ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let urlsToDelete: string[] = [];

    const urlParam = searchParams.get('url');
    if (urlParam) {
      urlsToDelete.push(urlParam);
    }

    // Also check JSON body for batch deletion
    try {
      const body = await req.json();
      if (Array.isArray(body.urls)) {
        urlsToDelete.push(...body.urls);
      } else if (body.url) {
        urlsToDelete.push(body.url);
      }
    } catch {
      // Body may be empty if query params used
    }

    urlsToDelete = Array.from(new Set(urlsToDelete.filter(Boolean)));

    if (urlsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune URL de média spécifiée à supprimer' },
        { status: 400 }
      );
    }

    // 1. Mark in cloudDb deleted URLs
    const currentDeleted = (await cloudDb.get<string[]>('media_deleted_urls', [])) || [];
    const updatedDeleted = Array.from(new Set([...currentDeleted, ...urlsToDelete]));
    await cloudDb.set('media_deleted_urls', updatedDeleted);

    // 2. Remove from custom media_library in cloudDb
    const currentCustom = (await cloudDb.get<MediaFile[]>('media_library', [])) || [];
    const updatedCustom = currentCustom.filter((m) => !urlsToDelete.includes(m.url));
    await cloudDb.set('media_library', updatedCustom);

    // 3. Attempt physical file deletion from disk if within public/uploads
    for (const fileUrl of urlsToDelete) {
      try {
        if (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('uploads/')) {
          const cleanPath = fileUrl.replace(/^\//, '');
          const fullPath = path.join(process.cwd(), 'public', cleanPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      } catch (err) {
        console.warn('Could not unlink file on disk (read-only filesystem):', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${urlsToDelete.length} élément(s) supprimé(s) avec succès`,
      deletedUrls: urlsToDelete,
    });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la suppression du média' },
      { status: 500 }
    );
  }
}
