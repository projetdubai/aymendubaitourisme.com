import { NextResponse } from 'next/server';
import { getAnalyticsStats } from '@/lib/analytics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const stats = await getAnalyticsStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error getting analytics stats:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des statistiques.' },
      { status: 500 }
    );
  }
}
