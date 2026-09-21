import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/routing";
import { Car, Fuel, Gauge, ShieldCheck, KeyRound, Sparkles, CheckCircle2 } from "lucide-react";
import { SERVICE_IMAGES, SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import { readCars, readCarsAsync } from "@/lib/cars";
import CarFleetSection from "@/components/cars/CarFleetSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface CarsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Luxury & Economical Car Rental Dubai - AYMEN DUBAI TOURISME",
    ar: "تأجير السيارات الفاخرة والاقتصادية في دبي - أيمن دبي للسياحة",
    fr: "Location de Voitures de Luxe & Tourisme à Dubaï - AYMEN DUBAI TOURISME",
  };
  const descriptions: Record<string, string> = {
    en: "Rent luxury sports cars, premium SUVs, and comfortable family vehicles in Dubai on daily, weekly, or monthly flexible terms with airport delivery.",
    ar: "استأجر سيارات رياضية فاخرة وسيارات دفع رباعي وسيارات عائلية مريحة في دبي يومياً وأسبوعياً وشهرياً مع توصيل المطار.",
    fr: "Louez des supercars, SUV de prestige et berlines haut de gamme à Dubaï au jour, à la semaine ou au mois avec livraison aéroport.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function CarsPage({ params }: CarsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cars = await readCarsAsync();

  const isAr = locale === "ar";
  const isFr = locale === "fr";

  const content = {
    badge: isAr ? "تأجير سيارات متميز" : isFr ? "Location de Véhicules d'Élite" : "Premium Car Rental",
    title: isAr ? "أسطول سيارات فاخرة واقتصادية في دبي" : isFr ? "Location de Voitures de Prestige & Économiques" : "Luxury & Executive Car Rentals in Dubai",
    subtitle: isAr
      ? "استمتع بقيادة سيارات رياضية خارقة وسيارات الدفع الرباعي الفاخرة أو اختر سيارات اقتصادية وعائلية بخطط يومية وأسبوعية وشهرية مريحة."
      : isFr
      ? "Sillonnez les avenues de Dubaï au volant de supercars spectaculaires, de SUV prestigieux ou de berlines confortables avec livraison gratuite."
      : "Cruise Dubai's iconic boulevards in high-performance sports cars, luxury SUVs, or modern executive sedans on daily, weekly, and monthly rates.",
    ctaQuote: isAr ? "طلب حجز سيارة" : isFr ? "Demander un devis auto" : "Request Car Quote",
    ctaWhatsapp: isAr ? "حجز مباشر عبر واتساب" : isFr ? "Réserver via WhatsApp" : "Reserve on WhatsApp",
    categoriesTitle: isAr ? "فئات أسطول السيارات" : isFr ? "Catégories de Notre Flotte" : "Our Rental Fleet",
    categories: [
      {
        name: isAr ? "السيارات الرياضية الفاخرة (Supercars)" : isFr ? "Supercars & Voitures de Sport" : "Supercars & Sports Exotics",
        desc: isAr ? "فيراري، لامبورغيني، بورش، وماكلارين لأقصى درجات الإثارة والأناقة." : isFr ? "Ferrari, Lamborghini, Porsche et McLaren pour vivre des sensations uniques." : "Ferrari, Lamborghini, Porsche, and McLaren for unforgettable Dubai thrills.",
        badge: isAr ? "الأكثر إثارة" : isFr ? "Exception" : "High Performance",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop",
        features: [
          isAr ? "محركات V8 و V10 و V12 جبارة" : isFr ? "Moteurs V8 / V10 d'exception" : "High-output performance engines",
          isAr ? "تسليم فوري للمطار أو الفندق" : isFr ? "Livraison gratuite aéroport/hôtel" : "Complimentary delivery to hotel or airport",
          isAr ? "خيارات يومية وأسبوعية مرنة" : isFr ? "Formules journée ou semaine" : "Daily & weekly flexible packages",
        ],
      },
      {
        name: isAr ? "سيارات الدفع الرباعي الفاخرة (Luxury SUVs)" : isFr ? "SUV Haut de Gamme & Prestige" : "Luxury Prestige SUVs",
        desc: isAr ? "رينج روفر، مرسيدس G-Wagon، كاديلاك إسكاليد، وبي إم دبليو X7 لراحة العائلة والفخامة." : isFr ? "Range Rover, Mercedes G-Class, Cadillac Escalade et BMW X7." : "Range Rover, Mercedes G-Class, Cadillac Escalade, and BMW X7 for executive luxury.",
        badge: isAr ? "فخامة ومساحة" : isFr ? "Confort Royal" : "Spacious Luxury",
        image: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?q=80&w=600&auto=format&fit=crop",
        features: [
          isAr ? "مساحة واسعة للركاب والأمتعة" : isFr ? "Habitacle spacieux & grand coffre" : "Generous passenger & luggage capacity",
          isAr ? "مثالية للرحلات والاجتماعات والعائلات" : isFr ? "Parfait pour familles et business" : "Ideal for families, business, and touring",
          isAr ? "أحدث أنظمة الأمان والترفيه" : isFr ? "Technologies de pointe & sécurité" : "State-of-the-art tech & safety features",
        ],
      },
      {
        name: isAr ? "السيارات الاقتصادية والعائلية الحديثة" : isFr ? "Berlines & Citadines Économiques" : "Modern Sedans & Economy Cars",
        desc: isAr ? "سيارات حديثة موفرة للوقود، مريحة وعملية للتنقل اليومي بأفضل الأسعار التنافسية." : isFr ? "Véhicules récents, économiques et très confortables pour explorer Dubaï." : "Modern fuel-efficient sedans for comfortable and budget-conscious daily commutes.",
        badge: isAr ? "أفضل سعر" : isFr ? "Économique" : "Best Rates",
        image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop",
        features: [
          isAr ? "استهلاك وقود اقتصادي جداً" : isFr ? "Faible consommation d'essence" : "Exceptional fuel efficiency",
          isAr ? "عقود إيجار شهرية مخفضة" : isFr ? "Tarifs mensuels très avantageux" : "Special discounted monthly leases",
          isAr ? "صيانة وتأمين شامل متضمن" : isFr ? "Assurance et entretien inclus" : "Included maintenance and standard insurance",
        ],
      },
    ],
    termsTitle: isAr ? "خطط الإيجار المرنة" : isFr ? "Nos Formules de Location" : "Flexible Rental Plans",
    plans: [
      {
        title: isAr ? "تأجير يومي" : isFr ? "Location Journalière" : "Daily Rental",
        desc: isAr ? "مرونة كاملة ليوم واحد أو عطلة نهاية الأسبوع." : isFr ? "Idéal pour une journée d'exploration ou un week-end." : "Maximum flexibility for short visits, weekend getaways, or special occasions.",
      },
      {
        title: isAr ? "تأجير أسبوعي" : isFr ? "Location Hebdomadaire" : "Weekly Rental",
        desc: isAr ? "خصم خاص للإقامات الممتدة لـ 7 أيام أو أكثر." : isFr ? "Tarif préférentiel pour les séjours de 7 jours et plus." : "Discounted rates for 7+ days with extended mileage allowances.",
      },
      {
        title: isAr ? "تأجير شهري" : isFr ? "Location Mensuelle" : "Monthly Long-Term Lease",
        desc: isAr ? "أفضل قيمة للإقامات الطويلة والمقيمين الجدد في دبي." : isFr ? "La meilleure valeur pour les expatriés et longs séjours." : "Unbeatable value with full servicing, zero depreciation, and free vehicle swap.",
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
              src={SERVICE_IMAGES.cars}
              alt="Dubai Car Rental"
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
                  <Link href="/quote?service=cars">
                    {content.ctaQuote}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="whatsapp">
                  <a
                    href={getWhatsAppUrl(
                      SITE_CONFIG.whatsapp,
                      isAr ? "مرحباً، أود الاستفسار عن تأجير سيارة في دبي" : isFr ? "Bonjour, je souhaite louer une voiture à Dubaï" : "Hello, I would like to inquire about car rentals in Dubai"
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

        {/* Dynamic Interactive Car Fleet Showcase */}
        <CarFleetSection initialCars={cars} locale={locale} />

        {/* Fleet Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-2 text-navy-900 mb-4">{content.categoriesTitle}</h2>
              <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.categories.map((cat, i) => (
                <Card key={i} className="overflow-hidden bg-white border border-cream-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-4 start-4">
                      <Badge variant="gold" className="text-xs">
                        {cat.badge}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-navy-900 mb-2">{cat.name}</h3>
                    <p className="text-navy-700 text-sm mb-6">{cat.desc}</p>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {cat.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-navy-800">
                          <CheckCircle2 className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="primary" className="w-full bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 transition-colors">
                      <Link href={`/quote?service=cars&category=${encodeURIComponent(cat.name)}`}>
                        {content.ctaQuote}
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Flexible Terms */}
        <section className="bg-navy-900 text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-2 text-white mb-4">{content.termsTitle}</h2>
              <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.plans.map((p, idx) => (
                <div key={idx} className="p-8 bg-navy-800/60 rounded-xl border-t-2 border-gold-500 text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">{p.title}</h3>
                  <p className="text-cream-100/80 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
