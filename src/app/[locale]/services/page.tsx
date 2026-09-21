import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Services } from "@/components/sections/Services";
import ExtraServices from "@/components/sections/ExtraServices";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import CustomServicesGrid from "@/components/sections/CustomServicesGrid";
import { readServicesAsync } from "@/lib/services";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Our Services - AYMEN DUBAI TOURISME",
    ar: "خدماتنا - أيمن دبي للسياحة",
    fr: "Nos Services - AYMEN DUBAI TOURISME",
  };
  const descriptions: Record<string, string> = {
    en: "Explore premium Dubai tourism services: visa processing, hotel reservations, flight bookings, car rental, and luxury real estate.",
    ar: "استكشف خدمات السياحة الفاخرة في دبي: التأشيرات، حجز الفنادق، حجز الطيران، تأجير السيارات، والعقارات الفاخرة.",
    fr: "Découvrez nos services d'excellence à Dubaï : visas, hôtels, vols, location de véhicules et immobilier de prestige.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const services = await readServicesAsync();

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen">
        <CustomServicesGrid services={services} locale={locale} />
        <Services initialServices={services} locale={locale} />
        <ExtraServices />
        <WhyChooseUs />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
