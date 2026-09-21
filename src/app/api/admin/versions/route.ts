import { NextResponse } from 'next/server';
import { readVersionsAsync, createVersionSnapshotAsync } from '@/lib/versions';
import { revalidateSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const versions = await readVersionsAsync();
    return NextResponse.json({ success: true, versions });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des versions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { note, author } = body;
    
    if (!note) {
      return NextResponse.json(
        { success: false, message: 'La note est requise' },
        { status: 400 }
      );
    }

    const version = await createVersionSnapshotAsync(note, author);
    await revalidateSite();

    return NextResponse.json({ success: true, version });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la version' },
      { status: 500 }
    );
  }
}
