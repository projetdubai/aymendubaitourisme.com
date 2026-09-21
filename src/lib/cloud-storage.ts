import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  provider: 'cloudinary' | 'vercel-blob' | 'imgbb' | 'disk' | 'base64';
  name: string;
}

/**
 * Cloudinary signature generator
 */
function generateCloudinarySignature(params: Record<string, string | number>, apiSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + apiSecret;
  return crypto.createHash('sha1').update(toSign).digest('hex');
}

/**
 * Upload an image buffer or file to cloud storage (or fallback)
 */
export async function uploadImageToCloud(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  // 1. Try Vercel Blob if BLOB_READ_WRITE_TOKEN is set
  const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (vercelBlobToken) {
    try {
      const blobRes = await fetch(
        `https://blob.vercel-storage.com/${encodeURIComponent(fileName)}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${vercelBlobToken}`,
            'x-add-random-suffix': 'true',
            'Content-Type': mimeType,
          },
          body: new Uint8Array(buffer),
        }
      );

      if (blobRes.ok) {
        const data = await blobRes.json();
        if (data?.url) {
          return {
            url: data.url,
            provider: 'vercel-blob',
            name: fileName,
          };
        }
      }
    } catch (err) {
      console.warn('Vercel Blob upload failed, falling back:', err);
    }
  }

  // 2. Try Cloudinary
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  // Parse CLOUDINARY_URL if provided (e.g. cloudinary://api_key:api_secret@cloud_name)
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
    try {
      const parsed = new URL(cloudinaryUrl);
      cloudName = parsed.hostname;
      apiKey = parsed.username;
      apiSecret = parsed.password;
    } catch (e) {
      console.warn('Failed to parse CLOUDINARY_URL:', e);
    }
  }

  if (cloudName) {
    try {
      const formData = new FormData();
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
      formData.append('file', base64Data);

      if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
      } else if (apiKey && apiSecret) {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = 'aymen-dubai';
        const signature = generateCloudinarySignature({ folder, timestamp }, apiSecret);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('folder', folder);
        formData.append('signature', signature);
      }

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.secure_url) {
          return {
            url: data.secure_url,
            provider: 'cloudinary',
            name: fileName,
          };
        }
      }
    } catch (err) {
      console.warn('Cloudinary upload error, falling back:', err);
    }
  }

  // 3. Try ImgBB if IMGBB_API_KEY is provided
  const imgbbKey = process.env.IMGBB_API_KEY;
  if (imgbbKey) {
    try {
      const formData = new FormData();
      formData.append('image', buffer.toString('base64'));
      formData.append('name', fileName);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.data?.url) {
          return {
            url: data.data.url,
            provider: 'imgbb',
            name: fileName,
          };
        }
      }
    } catch (err) {
      console.warn('ImgBB upload error, falling back:', err);
    }
  }

  // 4. Try local disk (Development / Persistent environment)
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${fileName}`,
      provider: 'disk',
      name: fileName,
    };
  } catch (diskErr) {
    console.warn('Disk upload failed (read-only environment), falling back to Base64:', diskErr);
  }

  // 5. Ultimate serverless fallback: Base64 Data URI
  const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;
  return {
    url: base64Url,
    provider: 'base64',
    name: fileName,
  };
}
