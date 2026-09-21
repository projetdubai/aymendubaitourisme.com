import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/lib/analytics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path : '/';
    const locale = typeof body.locale === 'string' ? body.locale : 'fr';

    await recordVisit(path, locale);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
