import { NextRequest, NextResponse } from 'next/server';
import { translateText, translateBatch } from '@/lib/translate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, fields, from = 'auto', to } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Target language "to" is required (e.g. "ar", "fr", "en")' },
        { status: 400 }
      );
    }

    // Batch translation if 'fields' map is provided
    if (fields && typeof fields === 'object') {
      const translatedFields = await translateBatch(fields, { from, to });
      return NextResponse.json({
        success: true,
        fields: translatedFields,
        from,
        to,
      });
    }

    // Single text translation
    if (typeof text === 'string') {
      const result = await translateText(text, { from, to });
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    return NextResponse.json(
      { error: 'Either "text" or "fields" must be provided in request body' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
