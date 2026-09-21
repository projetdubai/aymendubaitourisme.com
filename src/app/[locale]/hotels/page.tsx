import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { Link } from "@/i18n/routing";
import { MapPin, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake, Award } from "lucide-react";
import { SERVICE_IMAGES, SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface HotelsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Dubai Hotel Booking & Luxury Resorts - AYMEN DUBAI TOURISME",
    ar: "حجز فنادق ومنتجعات دبي الفاخرة - أيمن دبي للسياحة",
    fr: "Réservation d'Hôtels & Palaces à Dubaï - AYMEN DUBAI TOURISME",
  };
  const descriptions: Record<string, string> = {
    en: "Book premier hotels, luxury beachfront resorts, and boutique stays across Dubai with exclusive negotiated rates and VIP perks.",
    ar: "احجز أفضل فنادق ومنتجعات دبي الفاخرة على الشاطئ وفي وسط المدينة بأسعار حصرية ومزايا كبار الشخصيات.",
    fr: "Réservez les plus beaux hôtels et resorts de Dubaï aux meilleurs tarifs négociés avec surclassement et avantages VIP.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function HotelsPage({ params }: HotelsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === "ar";
  const isFr = locale === "fr";

  const content = {
    badge: isAr ? "حجوزات فندقية حصرية" : isFr ? "Séjours & Hôtels d'Exception" : "Exclusive Hotel Reservations",
    title: isAr ? "أرقى فنادق ومنتجعات دبي بأسعار تفضيلية" : isFr ? "Les Plus Beaux Hôtels & Resorts de Dubaï" : "Luxury Dubai Hotels & Resorts",
    subtitle: isAr
      ? "من إطلالات برج خليفة الساحرة إلى منتجعات نخلة جميرا الفاخرة، نضمن لك أفضل الأسعار مع مزايا الضيافة الخاصة وحجوزات كبار الشخصيات."
      : isFr
      ? "Des vues spectaculaires sur Burj Khalifa aux villas sur l'eau de Palm Jumeirah, profitez de tarifs préférentiels et d'un service VIP sur mesure."
      : "From iconic Burj Khalifa skyline views to serene Palm Jumeirah beachfront retreats, access handpicked luxury hotels with negotiated rates and VIP amenities.",
    ctaQuote: isAr ? "طلب حجز فندقي" : isFr ? "Demander un devis hôtel" : "Request Hotel Quote",
    ctaWhatsapp: isAr ? "استفسر عبر واتساب" : isFr ? "Discuter sur WhatsApp" : "Inquire on WhatsApp",
    hotelsTitle: isAr ? "خيارات الإقامة الأكثر تميزاً" : isFr ? "Nos Sélections Hôtelières" : "Featured Accommodations",
    featuredHotels: [
      {
        name: isAr ? "منتجعات نخلة جميرا الفاخرة" : isFr ? "Resorts de Luxe - Palm Jumeirah" : "Palm Jumeirah Luxury Resorts",
        category: isAr ? "منتجع شاطئي 5 نجوم" : isFr ? "Resort Bord de Mer 5*" : "5-Star Beachfront Resort",
        location: "Palm Jumeirah, Dubai",
        rating: 5,
        desc: isAr ? "شواطئ خاصة، أحواض سباحة إنفينيتي، ومطاعم عالمية حائزة على نجوم ميشلان." : isFr ? "Plages privées, piscines à débordement et gastronomie étoilée." : "Private pristine beaches, infinity pools, and world-class Michelin dining.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: isAr ? "فنادق داون تاون برج خليفة" : isFr ? "Hôtels de Prestige - Downtown Dubai" : "Downtown Burj Khalifa Hotels",
        category: isAr ? "إطلالة ساحرة على البرج والنافورة" : isFr ? "Vue Burj Khalifa & Fontaines" : "Iconic Burj & Fountain View",
        rating: 5,
        desc: isAr ? "في قلب دبي النابض، خطوات من دبي مول ودبي أوبرا مع خدمة ضيافة ملكية." : isFr ? "Au cœur vibrant de Dubaï, à deux pas du Dubai Mall avec service majordome." : "In the vibrating heart of Dubai, steps from Dubai Mall with royal hospitality.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
      },
      {
        name: isAr ? "أجنحة دبي مارينا الفاخرة" : isFr ? "Suites Haut de Gamme - Dubai Marina" : "Dubai Marina Waterfront Suites",
        category: isAr ? "إطلالة بانورامية على المارينا واليخوت" : isFr ? "Vue Panoramique Marina" : "Waterfront & Yacht Views",
        rating: 5,
        desc: isAr ? "أجواء عصرية حيوية، ممشى المارينا، وقريب من شاطئ JBR والمطاعم الفاخرة." : isFr ? "Ambiance chic en front de mer, promenade de la marina et proximité plage JBR." : "Vibrant chic waterfront living, Marina promenade walks, and proximity to JBR beach.",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600&auto=format&fit=crop",
      },
    ],
    perksTitle: isAr ? "مزايا الحجز مع أيمن دبي للسياحة" : isFr ? "Les Avantages de Réserver avec Nous" : "Exclusive Booking Privileges",
    perks: [
      {
        title: isAr ? "أسعار تفضيلية مباشرة" : isFr ? "Tarifs Négociés Exclusifs" : "Best Rate Guarantee",
        desc: isAr ? "علاقات مباشرة مع كبرى السلاسل الفندقية تضمن لك أسعاراً أقل من المنصات العالمية." : isFr ? "Des accords directs avec les chaînes hôtelières pour vous garantir les meilleurs prix." : "Direct agreements with luxury chains offer competitive rates below online booking engines.",
        icon: Award,
      },
      {
        title: isAr ? "ترقيات ومزايا إضافية" : isFr ? "Avantages VIP & Surclassements" : "Complimentary VIP Perks",
        desc: isAr ? "إمكانية ترقية الغرفة، إفطار مجاني، وتسجيل دخول مبكر وخروج متأخر حسب الإمكانية." : isFr ? "Surclassement selon disponibilité, petit-déjeuner offert et départs tardifs." : "Subject-to-availability room upgrades, complimentary breakfasts, and flexible check-out.",
        icon: Sparkles,
      },
      {
        title: isAr ? "إلغاء ومرونة عالية" : isFr ? "Conditions Flexibles" : "Flexible Terms",
        desc: isAr ? "شروط حجز مرنة وسياسات تعديل مريحة تناسب برنامج رحلتك." : isFr ? "Conditions d'annulation souples et modifications aisées de vos dates de séjour." : "Stress-free modification terms adapted to your international travel schedule.",
        icon: ShieldCheck,
      },
      {
        title: isAr ? "خدمة كونسيرج شخصية" : isFr ? "Conciergerie Personnalisée" : "Personal Travel Concierge",
        desc: isAr ? "مساعد شخصي يهتم بجميع متطلباتك وتنسيق استقبال المطار والمطاعم." : isFr ? "Un conseiller dédié pour coordonner transferts, réservations de tables et souhaits particuliers." : "Dedicated concierge arranging private airport transfers, restaurant bookings, and special requests.",
        icon: HeartHandshake,
      },
    ],
  };

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream-50">
        {/* Hero */}
        <section className="relative bg-navy-900 text-white py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <Image
              src={SERVICE_IMAGES.hotels}
              alt="Dubai Luxury Hotels"
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
                  <Link href="/quote?service=hotels">
                    {content.ctaQuote}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="whatsapp">
                  <a
                    href={getWhatsAppUrl(
                      SITE_CONFIG.whatsapp,
                      isAr ? "مرحباً، أود الاستفسار عن حجز فندق في دبي" : isFr ? "Bonjour, je souhaite réserver un hôtel à Dubaï" : "Hello, I would like to inquire about booking a luxury hotel in Dubai"
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

        {/* Featured Hotels */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-2 text-navy-900 mb-4">{content.hotelsTitle}</h2>
              <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.featuredHotels.map((hotel, index) => (
                <Card key={index} className="overflow-hidden bg-white border border-cream-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={hotel.image}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-4 start-4">
                      <Badge variant="gold" className="text-xs">
                        {hotel.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 text-gold-500 mb-2">
                      <StarRating rating={hotel.rating} readOnly size={16} />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-2">{hotel.name}</h3>
                    <div className="flex items-center gap-2 text-navy-700 text-sm mb-3">
                      <MapPin className="w-4 h-4 text-gold-500" />
                      <span>{hotel.location}</span>
                    </div>
                    <p className="text-navy-700 text-sm mb-6 flex-grow">{hotel.desc}</p>
                    <Button asChild variant="primary" className="w-full bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 transition-colors">
                      <Link href={`/quote?service=hotels&hotel=${encodeURIComponent(hotel.name)}`}>
                        {content.ctaQuote}
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Privileges */}
        <section className="bg-navy-900 text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-2 text-white mb-4">{content.perksTitle}</h2>
              <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.perks.map((perk, idx) => {
                const Icon = perk.icon;
                return (
                  <div key={idx} className="p-6 bg-navy-800/60 rounded-xl border-s-2 border-gold-500">
                    <Icon className="w-8 h-8 text-gold-500 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">{perk.title}</h3>
                    <p className="text-cream-100/80 text-sm leading-relaxed">{perk.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
