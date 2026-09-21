import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { RealEstate } from "@/components/sections/RealEstate";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/routing";
import { SERVICE_IMAGES, SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RealEstatePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Dubai Real Estate & Property Investments - AYMEN DUBAI TOURISME",
    ar: "عقارات دبي والاستثمار العقاري - أيمن دبي للسياحة",
    fr: "Immobilier à Dubaï : Location & Vente - AYMEN DUBAI TOURISME",
  };
  const descriptions: Record<string, string> = {
    en: "Discover luxury apartments, prime villas, and commercial real estate in Dubai. Residential rentals, off-plan developer projects, and ready investment sales.",
    ar: "اكتشف أفخم شقق وفلل وعقارات دبي التجارية للإيجار والبيع، ومشاريع على الخارطة واستثمارات عقارية بعوائد مجزية.",
    fr: "Achetez ou louez votre bien immobilier à Dubaï : appartements de luxe, villas prestigieuses, sur plan et prêts à emménager.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function RealEstatePage({ params }: RealEstatePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === "ar";
  const isFr = locale === "fr";

  const content = {
    badge: isAr ? "استشارات واستثمار عقاري" : isFr ? "Conseil & Investissement Immobilier" : "Real Estate & Investments",
    title: isAr ? "عقارات فاخرة للإيجار والبيع في دبي" : isFr ? "Immobilier de Prestige à Dubaï" : "Prime Dubai Real Estate & Properties",
    subtitle: isAr
      ? "شقق فاخرة، فلل شاطئية، ومكاتب تجارية في أفضل مناطق دبي (داون تاون، نخلة جميرا، المارينا، دبي هيلز) للإيجار والاستثمار المربح."
      : isFr
      ? "Appartements haut de gamme, villas d'architecte et locaux commerciaux dans les quartiers les plus recherchés de Dubaï."
      : "Luxury furnished & unfurnished apartments, waterfront villas, and commercial spaces across Dubai's most coveted districts.",
    ctaQuote: isAr ? "طلب استشارة عقارية" : isFr ? "Demander conseil" : "Request Property Quote",
    ctaWhatsapp: isAr ? "تواصل مع خبير عقاري" : isFr ? "Contacter un agent via WhatsApp" : "Talk to Real Estate Advisor",
  };

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream-50">
        {/* Real Estate Hero Banner */}
        <section className="relative bg-navy-900 text-white py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <Image
              src={SERVICE_IMAGES.realEstate}
              alt="Dubai Real Estate"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/40 mb-4">
                {content.badge}
              </Badge>
              <h1 className="heading-1 text-white mb-6">
                {content.title}
              </h1>
              <p className="text-cream-100 text-lg sm:text-xl leading-relaxed mb-8">
                {content.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" variant="primary" className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold border-0">
                  <Link href="/quote?service=real-estate">
                    {content.ctaQuote}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="whatsapp">
                  <a
                    href={getWhatsAppUrl(
                      SITE_CONFIG.whatsapp,
                      isAr ? "مرحباً، أود الاستفسار عن عقارات في دبي (إيجار / بيع)" : isFr ? "Bonjour, je cherche un bien immobilier à Dubaï (location / achat)" : "Hello, I am interested in Dubai properties (rental / purchase)"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content.ctaWhatsapp}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Real Estate Listings and Interactive Filter Section */}
        <div className="py-8">
          <RealEstate />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
