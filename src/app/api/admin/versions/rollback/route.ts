import { NextResponse } from 'next/server';
import { rollbackToVersion } from '@/lib/versions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { versionId } = body;
    
    if (!versionId) {
      return NextResponse.json(
        { success: false, message: 'ID de version requis' },
        { status: 400 }
      );
    }

    const result = await rollbackToVersion(versionId);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Version restaurée avec succès',
        version: result.version 
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la restauration de la version' },
      { status: 500 }
    );
  }
}
