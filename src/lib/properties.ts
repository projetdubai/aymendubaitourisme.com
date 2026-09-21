import fs from 'fs';
import path from 'path';
import os from 'os';
import { cloudDb } from './cloud-db';

export interface PropertyItem {
  id: string;
  title: string;
  location: string;
  type: string;
  category: string;
  price: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  status: string;
  createdAt?: string;
}

export const DEFAULT_PROPERTIES: PropertyItem[] = [
  {
    id: 'P-101',
    title: 'Villa de Prestige Palm Jumeirah',
    location: 'Palm Jumeirah',
    type: 'Villa',
    category: 'Vente',
    price: '15,000,000 AED',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
    bedrooms: 5,
    bathrooms: 6,
    area: '7,500 sqft',
    status: 'Active',
  },
  {
    id: 'P-102',
    title: 'Appartement de Luxe Downtown',
    location: 'Downtown Dubai',
    type: 'Appartement',
    category: 'Location',
    price: '120,000 AED/an',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,450 sqft',
    status: 'Active',
  },
  {
    id: 'P-103',
    title: 'Penthouse Panoramique Dubai Marina',
    location: 'Dubai Marina',
    type: 'Penthouse',
    category: 'Vente',
    price: '8,500,000 AED',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c0?q=80&w=800&auto=format&fit=crop',
    bedrooms: 4,
    bathrooms: 5,
    area: '4,200 sqft',
    status: 'Active',
  },
  {
    id: 'P-104',
    title: "Bureaux d'Affaires Business Bay",
    location: 'Business Bay',
    type: 'Bureau',
    category: 'Location',
    price: '250,000 AED/an',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
    bedrooms: 0,
    bathrooms: 2,
    area: '2,800 sqft',
    status: 'Active',
  },
];

declare global {
  var __properties_cache: PropertyItem[] | undefined;
}

const PRIMARY_FILE = path.join(process.cwd(), 'src', 'data', 'properties.json');
const TMP_FILE = path.join(os.tmpdir(), 'aymen_properties.json');

export function readProperties(): PropertyItem[] {
  if (globalThis.__properties_cache && Array.isArray(globalThis.__properties_cache) && globalThis.__properties_cache.length > 0) {
    return globalThis.__properties_cache;
  }

  // 1. Primary file
  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__properties_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read primary properties file:', err);
  }

  // 2. Tmp file
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__properties_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read tmp properties file:', err);
  }

  globalThis.__properties_cache = [...DEFAULT_PROPERTIES];
  return globalThis.__properties_cache;
}

export async function readPropertiesAsync(): Promise<PropertyItem[]> {
  try {
    const cloudProps = await cloudDb.get<PropertyItem[]>('properties');
    if (Array.isArray(cloudProps) && cloudProps.length > 0) {
      globalThis.__properties_cache = cloudProps;
      return cloudProps;
    }
  } catch (err) {
    console.warn('Could not read properties from cloudDb:', err);
  }

  // Direct Prisma table fallback
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('./prisma');
      const dbProps = await prisma.property.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      });
      if (Array.isArray(dbProps) && dbProps.length > 0) {
        const mapped: PropertyItem[] = dbProps.map((p) => ({
          id: p.id,
          title: p.titleFr || p.titleEn || p.titleAr,
          location: p.location,
          type: p.type === 'VILLA' ? 'Villa' : p.type === 'COMMERCIAL' ? 'Bureau' : 'Appartement',
          category: p.category === 'RENT' ? 'Location' : 'Vente',
          price: `${p.price.toString()} ${p.currency}${p.category === 'RENT' ? '/an' : ''}`,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: `${p.area} sqft`,
          status: p.active ? 'Active' : 'Inactive',
          createdAt: p.createdAt ? p.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        globalThis.__properties_cache = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn('Could not read from prisma.property:', err);
    }
  }

  return readProperties();
}

export async function writePropertiesAsync(properties: PropertyItem[]): Promise<boolean> {
  globalThis.__properties_cache = [...properties];

  // Try writing to primary file
  try {
    const dir = path.dirname(PRIMARY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, JSON.stringify(properties, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to primary properties file (read-only filesystem):', err);
  }

  // Always back up to tmp
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(properties, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to tmp properties file:', err);
  }

  // Await cloud persistence
  await cloudDb.set('properties', properties);
  cloudDb.invalidate('properties');

  // Also sync systematically using prisma.property.upsert()
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('./prisma');
      for (const p of properties) {
        const propType = (p.type?.toLowerCase().includes('villa') ? 'VILLA' : (p.type?.toLowerCase().includes('bureau') || p.type?.toLowerCase().includes('commercial') ? 'COMMERCIAL' : 'APARTMENT')) as any;
        const propCategory = (p.category?.toLowerCase().includes('location') || p.category?.toLowerCase().includes('rent') ? 'RENT' : 'SALE') as any;
        const cleanPrice = parseFloat(p.price?.replace(/[^0-9.]/g, '') || '0') || 0;
        const cleanArea = parseInt(p.area?.replace(/[^0-9]/g, '') || '0', 10) || 0;

        await prisma.property.upsert({
          where: { id: p.id },
          update: {
            titleEn: p.title,
            titleAr: p.title,
            titleFr: p.title,
            type: propType,
            category: propCategory,
            location: p.location || 'Dubai',
            bedrooms: Number(p.bedrooms) || 0,
            bathrooms: Number(p.bathrooms) || 0,
            area: cleanArea,
            price: cleanPrice,
            images: p.image ? [p.image] : [],
            active: p.status !== 'Archived' && p.status !== 'Inactive',
            updatedAt: new Date(),
          },
          create: {
            id: p.id,
            titleEn: p.title,
            titleAr: p.title,
            titleFr: p.title,
            type: propType,
            category: propCategory,
            location: p.location || 'Dubai',
            bedrooms: Number(p.bedrooms) || 0,
            bathrooms: Number(p.bathrooms) || 0,
            area: cleanArea,
            price: cleanPrice,
            images: p.image ? [p.image] : [],
            active: p.status !== 'Archived' && p.status !== 'Inactive',
          },
        });
      }
    } catch (err) {
      console.warn('Could not sync to prisma.property via upsert:', err);
    }
  }

  return true;
}

export function writeProperties(properties: PropertyItem[]): boolean {
  writePropertiesAsync(properties).catch((err) => {
    console.warn('writePropertiesAsync background warning:', err);
  });
  return true;
}

