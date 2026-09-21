import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Contact } from "@/components/sections/Contact";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Contact Us - AYMEN DUBAI TOURISME",
    ar: "اتصل بنا - أيمن دبي للسياحة",
    fr: "Contactez-Nous - AYMEN DUBAI TOURISME",
  };
  const descriptions: Record<string, string> = {
    en: "Get in touch with AYMEN DUBAI TOURISME for visa services, hotel bookings, car rental, and real estate in Dubai.",
    ar: "تواصل مع أيمن دبي للسياحة لخدمات التأشيرات وحجز الفنادق وتأجير السيارات والعقارات في دبي.",
    fr: "Contactez AYMEN DUBAI TOURISME pour les services de visa, réservation d'hôtels, location de voitures et immobilier à Dubaï.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
