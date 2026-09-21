import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { 
  readAllReviewsAsync,
  addCustomerReviewAsync 
} from '@/lib/reviews';
import { revalidateSite } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';

    const all = await readAllReviewsAsync();
    const pendingCount = all.filter((r) => r.status === 'pending').length;

    if (status === 'all') {
      return NextResponse.json({
        success: true,
        reviews: all,
        pendingCount,
      });
    }

    if (status === 'pending') {
      const pendingReviews = all.filter((r) => r.status === 'pending');
      return NextResponse.json({
        success: true,
        reviews: pendingReviews,
        pendingCount,
      });
    }

    if (status === 'rejected') {
      const rejectedReviews = all.filter((r) => r.status === 'rejected');
      return NextResponse.json({
        success: true,
        reviews: rejectedReviews,
        pendingCount,
      });
    }

    // Default: approved reviews for public website
    const approved = all
      .filter((r) => r.status === 'approved')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      reviews: approved,
      pendingCount,
    });
  } catch (error) {
    console.error('Error reading reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des avis.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Anti-spam honeypot: bots usually fill hidden input fields
    if (body.website || body.honeypot) {
      return NextResponse.json(
        { success: true, message: 'تم إرسال تقييمك بنجاح' },
        { status: 200 }
      );
    }

    const name = (body.author_name || body.name || '').trim();
    const comment = (body.comment || body.review || body.text || '').trim();
    const rating = Number(body.rating);
    const service = (body.service || 'Service Dubaï').trim();
    const country = (body.country || 'Dubaï').trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Veuillez saisir votre nom complet (au moins 2 caractères).' },
        { status: 400 }
      );
    }

    if (!comment || comment.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Veuillez rédiger un commentaire (au moins 3 caractères).' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Veuillez attribuer une note entre 1 et 5 étoiles.' },
        { status: 400 }
      );
    }

    const newReview = await addCustomerReviewAsync({
      author_name: name,
      rating,
      service,
      comment,
      country,
    });

    // Invalidate Next.js cache and cloudDb so admin and pages see the submission immediately
    await revalidateSite('reviews');
    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json(
      {
        success: true,
        message: 'شكراً لك! تم إرسال تقييمك بنجاح وسيظهر على الموقع بعد المراجعة.',
        messageFr: 'Merci ! Votre avis a été envoyé avec succès et sera publié après modération.',
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement de votre avis. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
