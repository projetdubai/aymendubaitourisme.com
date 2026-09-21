import fs from "fs";
import path from "path";
import os from "os";
import { cloudDb } from "./cloud-db";

export interface CarItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePerDay: string;
  pricePerWeek?: string;
  pricePerMonth?: string;
  image?: string;
  images: string[];
  transmission: string;
  seats: number;
  engine: string;
  features: string[];
  status: string;
  featured?: boolean;
}

export const DEFAULT_CARS: CarItem[] = [
  {
    id: "CAR-201",
    name: "Audi A3 Sedan 2025",
    brand: "Audi",
    category: "Berlines & Économiques",
    pricePerDay: "350 AED",
    pricePerWeek: "2,200 AED",
    pricePerMonth: "7,500 AED",
    image: "/cars/audi-a3-2025/1.jpeg",
    images: [
      "/cars/audi-a3-2025/1.jpeg",
      "/cars/audi-a3-2025/2.jpeg",
      "/cars/audi-a3-2025/3.jpeg",
      "/cars/audi-a3-2025/4.jpeg",
    ],
    transmission: "Automatique S-Tronic",
    seats: 5,
    engine: "2.0L TFSI 190 ch",
    features: ["Cockpit Virtuel Audi", "Climatisation Bizone", "Apple CarPlay & Android Auto", "Assurance tous risques incluse"],
    status: "Disponible",
    featured: false,
  },
  {
    id: "CAR-202",
    name: "BMW 520i M-Sport 2026",
    brand: "BMW",
    category: "Luxe & Prestige",
    pricePerDay: "750 AED",
    pricePerWeek: "4,800 AED",
    pricePerMonth: "16,500 AED",
    image: "/cars/bmw-520i-2026/1.jpeg",
    images: [
      "/cars/bmw-520i-2026/1.jpeg",
      "/cars/bmw-520i-2026/2.jpeg",
      "/cars/bmw-520i-2026/3.jpeg",
      "/cars/bmw-520i-2026/4.jpeg",
      "/cars/bmw-520i-2026/5.jpeg",
      "/cars/bmw-520i-2026/6.jpeg",
      "/cars/bmw-520i-2026/7.jpeg",
    ],
    transmission: "Automatique Steptronic",
    seats: 5,
    engine: "TwinPower Turbo 208 ch",
    features: ["Pack M-Sport complet", "BMW Curved Display", "Conduite semi-autonome", "Livraison aéroport VIP"],
    status: "Disponible",
    featured: true,
  },
  {
    id: "CAR-203",
    name: "BMW X6 xDrive 2026",
    brand: "BMW",
    category: "SUV de Luxe",
    pricePerDay: "1,400 AED",
    pricePerWeek: "8,900 AED",
    pricePerMonth: "29,000 AED",
    image: "/cars/bmw-x6-2026/1.jpeg",
    images: [
      "/cars/bmw-x6-2026/1.jpeg",
      "/cars/bmw-x6-2026/2.jpeg",
      "/cars/bmw-x6-2026/3.jpeg",
      "/cars/bmw-x6-2026/4.jpeg",
      "/cars/bmw-x6-2026/5.jpeg",
      "/cars/bmw-x6-2026/6.jpeg",
      "/cars/bmw-x6-2026/7.jpeg",
      "/cars/bmw-x6-2026/8.jpeg",
      "/cars/bmw-x6-2026/9.jpeg",
      "/cars/bmw-x6-2026/10.jpeg",
    ],
    transmission: "Automatique 8 Rapports",
    seats: 5,
    engine: "6 Cylindres en ligne 381 ch",
    features: ["Calandre Illuminée Iconic Glow", "Toit ouvrant panoramique Sky Lounge", "Son Harman Kardon", "Transmission intégrale xDrive"],
    status: "Disponible",
    featured: true,
  },
  {
    id: "CAR-204",
    name: "Land Rover Defender 110 2025",
    brand: "Land Rover",
    category: "SUV de Luxe",
    pricePerDay: "1,200 AED",
    pricePerWeek: "7,800 AED",
    pricePerMonth: "26,000 AED",
    image: "/cars/defender-2025/1.jpeg",
    images: [
      "/cars/defender-2025/1.jpeg",
      "/cars/defender-2025/2.jpeg",
      "/cars/defender-2025/3.jpeg",
      "/cars/defender-2025/4.jpeg",
      "/cars/defender-2025/5.jpeg",
    ],
    transmission: "Automatique 4x4",
    seats: 5,
    engine: "3.0L i6 Turbo 400 ch",
    features: ["Suspension pneumatique adaptative", "Caméras 3D Surround 360°", "Capacités tout-terrain extrêmes", "Design baroudeur moderne"],
    status: "Disponible",
    featured: true,
  },
  {
    id: "CAR-205",
    name: "Range Rover Sport Dynamic 2025",
    brand: "Land Rover",
    category: "SUV de Luxe",
    pricePerDay: "1,800 AED",
    pricePerWeek: "11,500 AED",
    pricePerMonth: "38,000 AED",
    image: "/cars/range-rover-sport-2025/1.jpeg",
    images: [
      "/cars/range-rover-sport-2025/1.jpeg",
      "/cars/range-rover-sport-2025/2.jpeg",
      "/cars/range-rover-sport-2025/3.jpeg",
      "/cars/range-rover-sport-2025/4.jpeg",
      "/cars/range-rover-sport-2025/5.jpeg",
    ],
    transmission: "Automatique 8 rapports",
    seats: 5,
    engine: "V8 P530 Twin Turbo",
    features: ["Finition Dynamic SE", "Sièges cuir massants", "Son Meridian Signature 3D", "Suspension Dynamic Response Pro"],
    status: "Disponible",
    featured: true,
  },
];

declare global {
  var __cars_cache: CarItem[] | undefined;
}

const PRIMARY_FILE = path.join(process.cwd(), "src", "data", "cars.json");
const TMP_FILE = path.join(os.tmpdir(), "aymen_cars.json");

export function readCars(): CarItem[] {
  // 1. Try reading primary file first (source of truth)
  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__cars_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read primary cars file, trying tmp:", err);
  }

  // 2. Check in-memory / cloudDb sync cache
  const cachedCloud = cloudDb.getSync<CarItem[]>("cars");
  if (Array.isArray(cachedCloud) && cachedCloud.length > 0) {
    return cachedCloud;
  }

  if (globalThis.__cars_cache && globalThis.__cars_cache.length > 0) {
    return globalThis.__cars_cache;
  }

  // 3. Try reading tmp file
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__cars_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read tmp cars file:", err);
  }

  // 4. Fallback to defaults
  globalThis.__cars_cache = [...DEFAULT_CARS];
  return globalThis.__cars_cache;
}

export async function readCarsAsync(): Promise<CarItem[]> {
  try {
    const cloudCars = await cloudDb.get<CarItem[]>("cars");
    if (Array.isArray(cloudCars) && cloudCars.length > 0) {
      globalThis.__cars_cache = cloudCars;
      return cloudCars;
    }
  } catch (err) {
    console.warn("Could not read cars from cloudDb:", err);
  }
  return readCars();
}

export async function writeCarsAsync(cars: CarItem[]): Promise<boolean> {
  globalThis.__cars_cache = [...cars];

  // Try writing to primary file
  try {
    const dir = path.dirname(PRIMARY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, JSON.stringify(cars, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to primary cars file (read-only filesystem):", err);
  }

  // Always back up to tmp
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(cars, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to tmp cars file:", err);
  }

  // Await save to Cloud DB
  await cloudDb.set("cars", cars);
  cloudDb.invalidate("cars");

  return true;
}

export function writeCars(cars: CarItem[]): boolean {
  writeCarsAsync(cars).catch((err) => {
    console.warn("Error saving cars to cloudDb in background:", err);
  });
  return true;
}

