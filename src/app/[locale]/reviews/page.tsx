import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Reviews } from "@/components/sections/Reviews";
import { getApprovedReviewsAsync } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface ReviewsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Customer Reviews - AYMEN DUBAI TOURISME",
    ar: "تقييمات العملاء - أيمن دبي للسياحة",
    fr: "Avis Clients - AYMEN DUBAI TOURISME",
  };
  const descriptions: Record<string, string> = {
    en: "Read what our clients say about AYMEN DUBAI TOURISME services. Leave your own review.",
    ar: "اقرأ ما يقوله عملاؤنا عن خدمات أيمن دبي للسياحة. شاركنا تقييمك.",
    fr: "Découvrez les avis de nos clients sur AYMEN DUBAI TOURISME. Partagez votre expérience.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const reviews = await getApprovedReviewsAsync();

  return (
    <>
      <Header />
      <main className="pt-20">
        <Reviews initialReviews={reviews} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
