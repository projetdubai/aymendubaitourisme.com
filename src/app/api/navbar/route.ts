import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { cloudDb } from '@/lib/cloud-db';
import { revalidateSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const DEFAULT_NAVBAR = [
  { id: 'nav-home', href: '/', labelFr: 'Accueil', labelAr: 'الرئيسية', labelEn: 'Home', enabled: true, order: 0 },
  { id: 'nav-services', href: '/services', labelFr: 'Services', labelAr: 'الخدمات', labelEn: 'Services', enabled: true, order: 1 },
  { id: 'nav-visa', href: '/visa', labelFr: 'Visas', labelAr: 'التأشيرات', labelEn: 'Visa', enabled: true, order: 2 },
  { id: 'nav-hotels', href: '/hotels', labelFr: 'Hôtels', labelAr: 'الفنادق', labelEn: 'Hotels', enabled: true, order: 3 },
  { id: 'nav-flights', href: '/flights', labelFr: 'Vols', labelAr: 'الرحلات الجوية', labelEn: 'Flights', enabled: true, order: 4 },
  { id: 'nav-cars', href: '/cars', labelFr: 'Voitures', labelAr: 'السيارات', labelEn: 'Cars', enabled: true, order: 5 },
  { id: 'nav-real-estate', href: '/real-estate', labelFr: 'Immobilier', labelAr: 'العقارات', labelEn: 'Real Estate', enabled: true, order: 6 },
  { id: 'nav-reviews', href: '/reviews', labelFr: 'Avis Clients', labelAr: 'التقييمات', labelEn: 'Reviews', enabled: true, order: 7 },
  { id: 'nav-contact', href: '/contact', labelFr: 'Contact', labelAr: 'اتصل بنا', labelEn: 'Contact', enabled: true, order: 8 }
];

export async function GET() {
  try {
    const siteContent = await cloudDb.get('site_content');
    if (siteContent?.navbar && Array.isArray(siteContent.navbar)) {
      return NextResponse.json({
        success: true,
        navbar: siteContent.navbar,
      });
    }

    // Disk fallback
    try {
      const diskPath = path.join(process.cwd(), 'src', 'data', 'site-content.json');
      if (fs.existsSync(diskPath)) {
        const parsed = JSON.parse(fs.readFileSync(diskPath, 'utf-8'));
        if (parsed?.navbar && Array.isArray(parsed.navbar)) {
          return NextResponse.json({
            success: true,
            navbar: parsed.navbar,
          });
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      navbar: DEFAULT_NAVBAR,
    });
  } catch (error) {
    console.error('Error fetching navbar:', error);
    return NextResponse.json({
      success: true,
      navbar: DEFAULT_NAVBAR,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { navbar } = body;

    if (!Array.isArray(navbar)) {
      return NextResponse.json(
        { success: false, message: 'Structure de navbar invalide.' },
        { status: 400 }
      );
    }

    const currentContent = (await cloudDb.get('site_content')) || {};
    const updatedContent = {
      ...currentContent,
      navbar,
      updatedAt: new Date().toISOString(),
    };

    await cloudDb.set('site_content', updatedContent);
    await revalidateSite('navbar');
    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({
      success: true,
      message: 'Barre de navigation mise à jour avec succès.',
      navbar,
    });
  } catch (error: any) {
    console.error('Error saving navbar:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Erreur lors de la mise à jour.' },
      { status: 500 }
    );
  }
}
