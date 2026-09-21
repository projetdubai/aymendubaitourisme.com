import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { 
  updateCustomerReviewAsync, 
  deleteCustomerReviewAsync 
} from '@/lib/reviews';
import { revalidateSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// PATCH /api/reviews/[id] — update moderation status or edit fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateCustomerReviewAsync(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Avis introuvable.' },
        { status: 404 }
      );
    }

    // Invalidate site cache so changes immediately reflect in public pages in < 1s
    await revalidateSite('reviews');
    try { revalidatePath('/', 'layout'); } catch {}

    const statusLabels: Record<string, string> = {
      approved: 'Avis approuvé et publié en direct sur le site public !',
      rejected: 'Avis refusé et masqué.',
      pending: 'Avis replacé en attente de modération.',
    };

    return NextResponse.json({
      success: true,
      message: body.status && statusLabels[body.status] ? statusLabels[body.status] : 'Avis mis à jour avec succès.',
      review: updated,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de l\'avis.' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] — full edit of review content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateCustomerReviewAsync(id, {
      author_name: body.author_name || body.name,
      rating: body.rating !== undefined ? Number(body.rating) : undefined,
      service: body.service,
      comment: body.comment || body.text,
      country: body.country,
      status: body.status,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Avis introuvable.' },
        { status: 404 }
      );
    }

    await revalidateSite('reviews');
    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({
      success: true,
      message: 'Avis modifié avec succès.',
      review: updated,
    });
  } catch (error) {
    console.error('Error updating review details:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la modification de l\'avis.' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] — delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteCustomerReviewAsync(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Avis introuvable.' },
        { status: 404 }
      );
    }

    await revalidateSite('reviews');
    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({
      success: true,
      message: 'Avis supprimé avec succès.',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de l\'avis.' },
      { status: 500 }
    );
  }
}
