import { setRequestLocale } from "next-intl/server";
import fs from "fs/promises";
import path from "path";
import { cloudDb } from "@/lib/cloud-db";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import ExtraServices from "@/components/sections/ExtraServices";
import { FounderSection } from "@/components/sections/FounderSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { RealEstate } from "@/components/sections/RealEstate";
import { Reviews } from "@/components/sections/Reviews";
import { Contact } from "@/components/sections/Contact";
import { FAQSection } from "@/components/sections/FAQSection";
import { PromoSection } from "@/components/sections/PromoSection";
import StructuredData from "@/components/seo/StructuredData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

interface SectionConfig {
  id: string;
  order: number;
  enabled?: boolean;
}

const defaultSections: SectionConfig[] = [
  { id: "hero", order: 1, enabled: true },
  { id: "services", order: 2, enabled: true },
  { id: "extra-services", order: 3, enabled: true },
  { id: "founder", order: 4, enabled: true },
  { id: "why-us", order: 5, enabled: true },
  { id: "real-estate", order: 6, enabled: true },
  { id: "reviews", order: 7, enabled: true },
  { id: "faq", order: 8, enabled: true },
  { id: "promo", order: 9, enabled: true },
  { id: "contact", order: 10, enabled: true },
];

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  let sections: SectionConfig[] = defaultSections;

  try {
    const siteData = await cloudDb.get<any>("site_content");
    if (siteData?.sections && Array.isArray(siteData.sections)) {
      sections = siteData.sections;
    } else {
      const dataPath = path.join(process.cwd(), "src", "data", "site-content.json");
      const fileContent = await fs.readFile(dataPath, "utf-8");
      const localData = JSON.parse(fileContent);
      if (localData.sections && Array.isArray(localData.sections)) {
        sections = localData.sections;
      }
    }
  } catch (error) {
    console.error("Failed to load sections config:", error);
  }

  // Filter enabled sections and sort by order
  const activeSections = sections
    .filter((sec) => sec.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const renderSection = (id: string) => {
    switch (id) {
      case "hero": return <Hero key="hero" />;
      case "services": return <Services key="services" />;
      case "extra-services": return <ExtraServices key="extra-services" />;
      case "founder": return <FounderSection key="founder" />;
      case "why-us": return <WhyChooseUs key="why-us" />;
      case "real-estate": return <RealEstate key="real-estate" />;
      case "reviews": return <Reviews key="reviews" />;
      case "faq": return <FAQSection key="faq" />;
      case "promo": return <PromoSection key="promo" />;
      case "contact": return <Contact key="contact" />;
      default: return null;
    }
  };

  return (
    <>
      <StructuredData locale={locale} />
      <Header />
      <main>
        {activeSections.map((sec) => renderSection(sec.id))}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
