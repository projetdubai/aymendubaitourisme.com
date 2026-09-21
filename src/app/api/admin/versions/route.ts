import { NextResponse } from 'next/server';
import { readVersions, createVersionSnapshot } from '@/lib/versions';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const versions = readVersions();
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

    const version = createVersionSnapshot(note, author);
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, version });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la version' },
      { status: 500 }
    );
  }
}
