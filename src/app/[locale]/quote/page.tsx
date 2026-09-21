import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import QuoteForm from "@/components/forms/QuoteForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface QuotePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: QuotePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "QuotePage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

function QuotePageContent() {
  const t = useTranslations("QuotePage");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50 pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-navy-700 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          <QuoteForm />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <QuotePageContent />;
}
