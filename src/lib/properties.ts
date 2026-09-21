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

  return true;
}

export function writeProperties(properties: PropertyItem[]): boolean {
  writePropertiesAsync(properties).catch((err) => {
    console.warn('writePropertiesAsync background warning:', err);
  });
  return true;
}
