import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/routing";
import { Plane, Compass, Clock, CheckCircle2, ShieldCheck, Headphones, Luggage, ArrowRight } from "lucide-react";
import { SERVICE_IMAGES, SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import { readFlightsAsync } from "@/lib/flights";
import AirlinesBars from "@/components/flights/AirlinesBars";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface FlightsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Flight Booking to Dubai - AYMEN DUBAI TOURISME",
    ar: "حجز تذاكر الطيران إلى دبي - أيمن دبي للسياحة",
    fr: "Réservation de Vols Dubaï - AYMEN DUBAI TOURISME",
  };
  const descriptions: Record<string, string> = {
    en: "Secure optimal flight routes and competitive airfares to and from Dubai with major international carriers, flexible dates, and premium cabin options.",
    ar: "احجز رحلات الطيران الدولية من وإلى دبي بأفضل الأسعار على كبرى شركات الطيران العالمية مع مرونة كاملة في المواعيد.",
    fr: "Trouvez les meilleurs vols internationaux vers Dubaï avec Emirates et les plus grandes compagnies aériennes au meilleur tarif.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function FlightsPage({ params }: FlightsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === "ar";
  const isFr = locale === "fr";

  const content = {
    badge: isAr ? "حجوزات طيران دولية" : isFr ? "Billetterie Aérienne Internationale" : "International Flight Booking",
    title: isAr ? "أفضل رحلات الطيران إلى دبي وحول العالم" : isFr ? "Vols Vers Dubaï & le Monde Entier" : "Premier Flights to Dubai & Beyond",
    subtitle: isAr
      ? "نوفر لك عروض طيران استثنائية على طيران الإمارات وكبرى خطوط الطيران العالمية بدرجات السفر السياحية ورجال الأعمال والدرجة الأولى."
      : isFr
      ? "Voyagez en toute sérénité avec Emirates et les plus grandes compagnies internationales en classe Économique, Affaires ou Première."
      : "Access unbeatable airfares on Emirates, flydubai, and global alliance carriers with dedicated route optimization and premium cabin upgrades.",
    ctaQuote: isAr ? "طلب حجز تذكرة" : isFr ? "Demander un devis vol" : "Request Flight Quote",
    ctaWhatsapp: isAr ? "استفسر عبر واتساب" : isFr ? "Contacter sur WhatsApp" : "Inquire on WhatsApp",
    routesTitle: isAr ? "عروض الطيران والمسارات المباشرة إلى دبي" : isFr ? "Liaisons Populaires & Vols Vers Dubaï" : "Featured Flight Routes to Dubai",
    classesTitle: isAr ? "درجات السفر المتاحة" : isFr ? "Classes de Voyage Disponibles" : "Flight Cabin Classes",
    classes: [
      {
        name: isAr ? "الدرجة السياحية المتميزة" : isFr ? "Classe Économique & Premium" : "Economy & Premium Economy",
        desc: isAr ? "أفضل الأسعار مع وزن أمتعة مريح وخيارات مرنة للتعديل." : isFr ? "Tarifs avantageux avec franchises bagages généreuses et flexibilité." : "Smart competitive fares with generous luggage allowances and easy modifications.",
        badge: isAr ? "قيمة وتوفير" : isFr ? "Économique" : "Best Value",
        features: [
          isAr ? "مقارنة أفضل مسارات الرحلات" : isFr ? "Optimisation des itinéraires" : "Optimal direct and connection routes",
          isAr ? "شامل حقائب السفر كاملة" : isFr ? "Bagages inclus garantis" : "Included baggage allowance",
          isAr ? "اختيار المقاعد المفضلة" : isFr ? "Sélection de sièges" : "Preferred seat assignment",
        ],
      },
      {
        name: isAr ? "درجة رجال الأعمال (Business Class)" : isFr ? "Classe Affaires (Business Class)" : "Business Class",
        desc: isAr ? "مقاعد تتحول إلى سرير مستوٍ، دخول صالات كبار الشخصيات، وأولوية إنجاز الإجراءات." : isFr ? "Sièges-lits, accès aux salons VIP et embarquement prioritaire." : "Lie-flat beds, lounge access, gourmet dining, and priority check-in/boarding.",
        badge: isAr ? "راحة ورفاهية" : isFr ? "Confort VIP" : "Premium Comfort",
        features: [
          isAr ? "دخول صالات الانتظار الفاخرة" : isFr ? "Accès Salons VIP aéroport" : "Executive airport lounge access",
          isAr ? "أولوية الصعود واستلام الحقائب" : isFr ? "Embarquement & bagages prioritaires" : "Priority boarding & baggage delivery",
          isAr ? "خدمة سيارة مع سائق (مسارات محددة)" : isFr ? "Service chauffeur sur routes éligibles" : "Chauffeur drive service on select routes",
        ],
      },
      {
        name: isAr ? "الدرجة الأولى (First Class)" : isFr ? "Première Classe (First Class)" : "First Class Suites",
        desc: isAr ? "أجنحة خاصة مغلقة، تجربة سفر ملكية فاخرة، وخدمة كونسيرج مخصصة في المطار." : isFr ? "Suites privées, gastronomie d'exception et conciergerie aéroportuaire dédiée." : "Private enclosed suites, fine dining, and private airport terminal service.",
        badge: isAr ? "فخامة ملكية" : isFr ? "Excellence Absolue" : "Royal Luxury",
        features: [
          isAr ? "أجنحة خاصة مغلقة بالكامل" : isFr ? "Suites privées fermées" : "Private enclosed personal suites",
          isAr ? "استقبال خاص ومرافقة في المطار" : isFr ? "Accueil & escort aéroport VIP" : "VIP meet & assist at airport",
          isAr ? "أعلى درجات الخصوصية والمرونة" : isFr ? "Flexibilité et discrétion totales" : "Total itinerary flexibility & privacy",
        ],
      },
    ],
    whyTitle: isAr ? "لماذا تحجز طيرانك معنا؟" : isFr ? "Pourquoi Réserver Vos Billets Avec Nous ?" : "Why Book Flights With Us?",
    whyList: [
      {
        title: isAr ? "أسعار تنافسية وخيارات متعددة" : isFr ? "Tarifs Compétitifs" : "Competitive Fares",
        desc: isAr ? "نبحث في مئات الخيارات لنقدم لك أنسب توقيت وأفضل سعر." : isFr ? "Recherche parmi des centaines de vols pour le meilleur rapport qualité/prix." : "We analyze multiple airline options to locate the optimal combination of cost and schedule.",
        icon: Plane,
      },
      {
        title: isAr ? "مرونة وتعديل سلس" : isFr ? "Modifications Faciles" : "Flexible Date Changes",
        desc: isAr ? "إدارة كاملة لحجزك ومساعدتك في أي تعديل أو إلغاء طارئ." : isFr ? "Gestion complète de vos modifications ou annulations de dernière minute." : "Hands-on assistance if your plans change or flight adjustments are required.",
        icon: Clock,
      },
      {
        title: isAr ? "تنسيق متكامل مع الإقامة والتأشيرة" : isFr ? "Pack Voyage Tout-en-Un" : "All-in-One Coordination",
        desc: isAr ? "توافق تام بين مواعيد رحلتك وصلاحية التأشيرة وتواريخ الفندق." : isFr ? "Harmonisation parfaite avec vos dates de visa et réservation hôtelière." : "Seamless coordination between flight arrivals, visa validity, and hotel check-in.",
        icon: ShieldCheck,
      },
      {
        title: isAr ? "دعم مستمر حتى وصولك" : isFr ? "Support Voyage 24/7" : "24/7 Travel Assistance",
        desc: isAr ? "فريقنا متواجد لمتابعة رحلتك والتعامل مع أي تحديثات فورية." : isFr ? "Assistance permanente tout au long de votre trajet en cas d'imprévu." : "Real-time tracking and WhatsApp assistance until you safely reach Dubai.",
        icon: Headphones,
      },
    ],
  };

  const rawFlights = await readFlightsAsync();
  const activeFlights = rawFlights.filter((f) => f.active).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream-50">
        {/* Hero */}
        <section className="relative bg-navy-900 text-white py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <Image
              src={SERVICE_IMAGES.flights}
              alt="Dubai skyline - Flight Booking Aymen Dubai Tourisme"
              fill
              sizes="100vw"
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
                  <Link href="/quote?service=flights">
                    {content.ctaQuote}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="whatsapp">
                  <a
                    href={getWhatsAppUrl(
                      SITE_CONFIG.whatsapp,
                      isAr ? "مرحباً، أود الاستفسار عن حجز تذاكر طيران إلى دبي" : isFr ? "Bonjour, je souhaite réserver un vol pour Dubaï" : "Hello, I would like to inquire about booking flights to Dubai"
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

        <AirlinesBars locale={locale} />

        {/* Dynamic Flight Routes Section */}
        {activeFlights.length > 0 && (
          <section className="py-20 bg-white border-b border-cream-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="heading-2 text-navy-900 mb-4">{content.routesTitle}</h2>
                <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeFlights.map((flight) => {
                  const from = isAr ? (flight.fromCity?.ar || flight.fromCity?.fr) : isFr ? (flight.fromCity?.fr || flight.fromCity?.en) : (flight.fromCity?.en || flight.fromCity?.fr);
                  const to = isAr ? (flight.toCity?.ar || flight.toCity?.fr) : isFr ? (flight.toCity?.fr || flight.toCity?.en) : (flight.toCity?.en || flight.toCity?.fr);
                  const badge = isAr ? (flight.badge?.ar || flight.badge?.fr) : isFr ? (flight.badge?.fr || flight.badge?.en) : (flight.badge?.en || flight.badge?.fr);
                  const features = isAr ? (flight.features?.ar || flight.features?.fr) : isFr ? (flight.features?.fr || flight.features?.en) : (flight.features?.en || flight.features?.fr);

                  return (
                    <Card key={flight.id} className="overflow-hidden bg-white border border-cream-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col justify-between group">
                      <div>
                        <div className="relative h-44 w-full overflow-hidden bg-navy-950">
                          {flight.image && (
                            <Image
                              src={flight.image}
                              alt={`${flight.airline} ${from} to ${to}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-black/20" />
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 bg-gold-500 text-navy-900 text-[11px] font-black rounded-md shadow-md uppercase">
                              {badge}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-xs font-bold text-gold-400 tracking-wider uppercase mb-1">
                              {flight.airline} {flight.flightNumber && `• ${flight.flightNumber}`}
                            </p>
                            <div className="flex items-center gap-2 text-white font-black text-lg">
                              <span>{from}</span>
                              <ArrowRight size={18} className="text-gold-400 shrink-0" />
                              <span>{to}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-cream-100">
                            <div>
                              <p className="text-[11px] text-navy-500 font-bold uppercase">{isAr ? "ابتداءً من" : isFr ? "À partir de" : "Starting from"}</p>
                              <p className="text-xl font-black text-gold-600">{flight.priceStartingFrom}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 text-xs text-navy-700 font-bold justify-end">
                                <Luggage size={14} className="text-gold-500" />
                                <span>{flight.baggageAllowance}</span>
                              </div>
                              <span className="text-[11px] text-navy-400">{flight.duration}</span>
                            </div>
                          </div>

                          <ul className="space-y-2 mb-4">
                            {features?.slice(0, 3).map((feat, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-navy-800">
                                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <Button asChild variant="primary" className="w-full bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 font-bold transition-all shadow-sm">
                          <Link href={`/quote?service=flights&route=${encodeURIComponent(`${from} - ${to}`)}`}>
                            {content.ctaQuote}
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Classes */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-2 text-navy-900 mb-4">{content.classesTitle}</h2>
              <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.classes.map((c, i) => (
                <Card key={i} className="p-6 bg-white border border-cream-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="gold" className="text-xs">
                        {c.badge}
                      </Badge>
                      <Plane className="w-5 h-5 text-gold-500" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-2">{c.name}</h3>
                    <p className="text-navy-700 text-sm mb-6">{c.desc}</p>
                    <ul className="space-y-3 mb-8">
                      {c.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-navy-800">
                          <CheckCircle2 className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-cream-100">
                    <Button asChild variant="primary" className="w-full bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 transition-colors">
                      <Link href={`/quote?service=flights&cabin=${encodeURIComponent(c.name)}`}>
                        {content.ctaQuote}
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Book With Us */}
        <section className="bg-navy-900 text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-2 text-white mb-4">{content.whyTitle}</h2>
              <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.whyList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-6 bg-navy-800/60 rounded-xl border-s-2 border-gold-500">
                    <Icon className="w-8 h-8 text-gold-500 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-cream-100/80 text-sm leading-relaxed">{item.desc}</p>
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
