import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/routing";
import { CheckCircle2, Clock, FileCheck, Globe, ShieldCheck, Zap } from "lucide-react";
import { SERVICE_IMAGES, SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import { readVisasAsync } from "@/lib/visas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface VisaPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Dubai Visa & Extension Services - AYMEN DUBAI TOURISME",
    ar: "خدمات تأشيرة دبي وتمديد الإقامة - أيمن دبي للسياحة",
    fr: "Services de Visa Dubaï & Extension - AYMEN DUBAI TOURISME",
  };
  const descriptions: Record<string, string> = {
    en: "Fast and reliable 30-day, 60-day, and multiple-entry Dubai tourist visas and in-country extensions with AYMEN DUBAI TOURISME.",
    ar: "تأشيرات سياحية سريعة وموثوقة لدبي لمدة 30 و 60 يوماً وتأشيرات متعددة الدخول مع تمديد الإقامة بدون مغادرة الدولة.",
    fr: "Obtention rapide et fiable de visas touristiques 30 jours, 60 jours, entrées multiples et prolongation de visa sur place.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function VisaPage({ params }: VisaPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === "ar";
  const isFr = locale === "fr";

  const rawVisas = await readVisasAsync();
  const activeVisas = rawVisas.filter((v) => v.active).sort((a, b) => (a.order || 0) - (b.order || 0));

  const dynamicPlans = activeVisas.map((v) => ({
    id: v.slug || v.id,
    name: isAr ? (v.title?.ar || v.title?.fr) : isFr ? (v.title?.fr || v.title?.en) : (v.title?.en || v.title?.fr),
    desc: isAr ? (v.subtitle?.ar || v.subtitle?.fr) : isFr ? (v.subtitle?.fr || v.subtitle?.en) : (v.subtitle?.en || v.subtitle?.fr),
    badge: isAr ? (v.badge?.ar || v.badge?.fr) : isFr ? (v.badge?.fr || v.badge?.en) : (v.badge?.en || v.badge?.fr),
    price: v.price,
    duration: v.duration,
    processingTime: v.processingTime,
    features: (isAr ? (v.features?.ar || v.features?.fr) : isFr ? (v.features?.fr || v.features?.en) : (v.features?.en || v.features?.fr)) || [],
  }));

  const plans = dynamicPlans.length > 0 ? dynamicPlans : [
    {
      id: "1-month",
      name: isAr ? "تأشيرة سياحية شهر (30 يوماً)" : isFr ? "Visa Tourisme 1 Mois (30 Jours)" : "30-Day Tourist Visa",
      desc: isAr ? "مثالية للإجازات القصيرة وزيارات العمل السريعة." : isFr ? "Idéal pour les vacances et les séjours courts." : "Ideal for short vacations, family visits, or business trips.",
      badge: isAr ? "الأكثر طلباً" : isFr ? "Populaire" : "Most Popular",
      price: "450 AED",
      duration: "30 Jours",
      processingTime: "24h - 48h",
      features: [
        isAr ? "صلاحية الدخول 60 يوماً من الإصدار" : isFr ? "Validité d'entrée de 60 jours" : "60-day entry validity from issue",
        isAr ? "مدة الإقامة 30 يوماً داخل الإمارات" : isFr ? "Séjour de 30 jours aux EAU" : "30 days stay in UAE",
        isAr ? "إصدار سريع خلال 24-48 ساعة" : isFr ? "Délivrance rapide 24-48h" : "Fast turnaround (24-48 hrs)",
        isAr ? "شامل التأمين الصحي الإماراتي" : isFr ? "Assurance voyage incluse" : "UAE health insurance included",
      ],
    },
  ];

  const content = {
    badge: isAr ? "خدمات التأشيرات الرسمية" : isFr ? "Service Officiel de Visa" : "Official Visa Services",
    title: isAr ? "تأشيرات دبي السياحية وتمديد الإقامة" : isFr ? "Visas Touristiques Dubaï & Prolongation" : "Dubai Tourist Visas & Extensions",
    subtitle: isAr
      ? "إجراءات سريعة وسلسة للحصول على تأشيرة دخول دبي (شهر، شهرين، متعددة الدخول) بالإضافة إلى تمديد الإقامة دون الحاجة لمغادرة الدولة."
      : isFr
      ? "Procédures rapides et simplifiées pour votre visa touristique Dubaï (1 mois, 2 mois, entrées multiples) et extensions sur place."
      : "Fast, stress-free processing for 1-month, 2-month, and multiple-entry Dubai tourist visas, plus seamless in-country extensions.",
    ctaQuote: isAr ? "طلب عرض سعر فوري" : isFr ? "Demander un devis" : "Get a Quote",
    ctaWhatsapp: isAr ? "استشارة عبر واتساب" : isFr ? "Conseil via WhatsApp" : "Inquire on WhatsApp",
    visaTypesTitle: isAr ? "أنواع التأشيرات المتاحة" : isFr ? "Types de Visas Disponibles" : "Available Visa Options",
    whyTitle: isAr ? "لماذا تقدم تأشيرتك مع أيمن دبي للسياحة؟" : isFr ? "Pourquoi Choisir AYMEN DUBAI TOURISME pour votre Visa ?" : "Why Apply With AYMEN DUBAI TOURISME?",
    benefits: [
      {
        title: isAr ? "نسبة موافقة عالية جداً" : isFr ? "Taux d'Approbation Maximal" : "High Approval Rate",
        desc: isAr ? "تدقيق دقيق لجميع المستندات قبل التقديم لضمان القبول الفوري." : isFr ? "Vérification rigoureuse des documents avant soumission." : "Thorough document pre-check ensures swift government approval.",
        icon: ShieldCheck,
      },
      {
        title: isAr ? "إنجاز فائق السرعة" : isFr ? "Délivrance Express" : "Fast Turnaround",
        desc: isAr ? "إصدار التأشيرة خلال 24 إلى 48 ساعة كحد أقصى." : isFr ? "Obtenez votre visa en 24h à 48h maximum." : "Fast-track processing within 24 to 48 hours directly to your email.",
        icon: Zap,
      },
      {
        title: isAr ? "مستندات مبسطة" : isFr ? "Formalités Simplifiées" : "Minimal Documents",
        desc: isAr ? "صورة جواز السفر وصورة شخصية فقط لمعظم الجنسيات." : isFr ? "Seulement une copie du passeport et une photo." : "Just passport copy and photo required for most eligible nationalities.",
        icon: FileCheck,
      },
      {
        title: isAr ? "دعم متواصل بلغتك" : isFr ? "Support Multilingue Dédié" : "Dedicated Support",
        desc: isAr ? "فريق عمل يتحدث العربية والإنجليزية والفرنسية لمساعدتك دائماً." : isFr ? "Équipe à votre écoute en Français, Arabe et Anglais." : "Native support in Arabic, English, and French via WhatsApp and phone.",
        icon: Globe,
      },
    ],
  };

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-cream-50">
        {/* Hero Section */}
        <section className="relative bg-navy-900 text-white py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src={SERVICE_IMAGES.visa}
              alt="Dubai Visa Services"
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
                  <Link href="/quote?service=visa">
                    {content.ctaQuote}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="whatsapp">
                  <a
                    href={getWhatsAppUrl(
                      SITE_CONFIG.whatsapp,
                      isAr ? "مرحباً، أود الاستفسار عن تأشيرات دبي وتمديد الإقامة" : isFr ? "Bonjour, je souhaite des informations pour un visa Dubaï" : "Hello, I would like to inquire about Dubai visa and extension services"
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

        {/* Visa Packages Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-2 text-navy-900 mb-4">{content.visaTypesTitle}</h2>
              <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-6 bg-white border border-cream-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between rounded-2xl">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="gold" className="text-xs">
                        {plan.badge}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gold-600 font-medium bg-gold-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-gold-500" />
                        <span>{plan.processingTime || '24h-48h'}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-black text-gold-600">{plan.price}</span>
                      {plan.duration && (
                        <span className="text-xs text-navy-500 font-medium">/ {plan.duration}</span>
                      )}
                    </div>
                    <p className="text-navy-700 text-sm mb-6 leading-relaxed">{plan.desc}</p>
                    <ul className="space-y-2.5 mb-8">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-navy-800">
                          <CheckCircle2 className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-cream-100">
                    <Button asChild variant="primary" className="w-full bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 font-bold transition-all shadow-sm">
                      <Link href={`/quote?service=visa&subService=${plan.id}`}>
                        {content.ctaQuote}
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="bg-navy-900 text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-2 text-white mb-4">{content.whyTitle}</h2>
              <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.benefits.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div key={idx} className="p-6 bg-navy-800/60 rounded-xl border-s-2 border-gold-500">
                    <Icon className="w-8 h-8 text-gold-500 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                    <p className="text-cream-100/80 text-sm leading-relaxed">{b.desc}</p>
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
