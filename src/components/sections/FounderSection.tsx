'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, MapPin, MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

const content = {
  fr: {
    heading: "Le Mot du Fondateur & Directeur",
    subheading: "BIENVENUE À DUBAÏ",
    paragraphs: [
      "Fort d'une solide expertise dans l'accueil, le tourisme et l'immobilier aux Émirats Arabes Unis, j'ai fondé AYMEN DUBAI TOURISME avec une vision claire : offrir à chaque voyageur un accompagnement d'exception, transparent et sur mesure.",
      "Que ce soit pour l'obtention de vos visas, la réservation de vols et d'hôtels de prestige, la mise à disposition de véhicules de luxe ou l'investissement immobilier à Dubaï, mon équipe et moi-même sommes personnellement engagés à vous garantir un service VIP 24h/24.",
      "Votre confiance est notre plus belle fierté."
    ],
    badges: [
      { text: "100% Service Sur Mesure", icon: CheckCircle2 },
      { text: "Support VIP 24/7", icon: ShieldCheck },
      { text: "Expertise Locale Dubaï", icon: MapPin }
    ],
    whatsappMsg: "Bonjour M. Aymen, je souhaite échanger directement avec vous concernant un voyage à Dubaï",
    contactBtn: "Contacter via WhatsApp",
    quoteBtn: "Demander un Devis",
    role: "Fondateur & Directeur Général"
  },
  ar: {
    heading: "كلمة المؤسس والمدير العام",
    subheading: "مرحباً بكم في دبي",
    paragraphs: [
      "انطلاقاً من خبرتنا العميقة في قطاع الضيافة، السياحة والعقارات في دولة الإمارات العربية المتحدة، أسسنا «أيمن دبي للسياحة» برؤية واضحة تهدف إلى تقديم تجربة سفر استثنائية وموثوقة تليق بضيوفنا الكرام.",
      "سواء كان هدفكم استخراج التأشيرات، حجز تذاكر الطيران وأرقى الفنادق، استئجار أحدث السيارات الفاخرة، أو الاستثمار العقاري الناجح في دبي، أضع أنا وفريقي كل إمكانياتنا لخدمتكم بمستوى VIP على مدار الساعة.",
      "ثقتكم ورضاكم هما غايتنا وأكبر نجاحاتنا."
    ],
    badges: [
      { text: "خدمة مخصصة 100%", icon: CheckCircle2 },
      { text: "دعم مستمر 24/7", icon: ShieldCheck },
      { text: "خبرة محلية في دبي", icon: MapPin }
    ],
    whatsappMsg: "مرحباً أستاذ أيمن، أود الاستفسار عن خدمات وكالة أيمن دبي للسياحة",
    contactBtn: "تواصل عبر واتساب",
    quoteBtn: "طلب عرض سعر",
    role: "المؤسس والمدير العام"
  },
  en: {
    heading: "A Message from the Founder",
    subheading: "WELCOME TO DUBAI",
    paragraphs: [
      "Drawing from extensive expertise in hospitality, tourism, and real estate across the United Arab Emirates, I established AYMEN DUBAI TOURISME with a clear mission: delivering tailored, transparent, and world-class travel services.",
      "Whether assisting with UAE and GCC visa issuance, premium flight and hotel arrangements, luxury vehicle rentals, or high-yield real estate investments in Dubai, our dedicated team and I are personally committed to providing 24/7 VIP service.",
      "Your trust is our greatest pride."
    ],
    badges: [
      { text: "100% Tailored Service", icon: CheckCircle2 },
      { text: "24/7 VIP Support", icon: ShieldCheck },
      { text: "Local Dubai Expertise", icon: MapPin }
    ],
    whatsappMsg: "Hello Mr. Aymen, I would like to inquire about your travel services in Dubai",
    contactBtn: "Contact via WhatsApp",
    quoteBtn: "Request a Quote",
    role: "Founder & CEO"
  }
};

export function FounderSection() {
  const locale = useLocale() as 'ar' | 'fr' | 'en';
  const isAr = locale === 'ar';
  const data = content[locale] || content.fr;
  
  const cleanPhone = SITE_CONFIG.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(data.whatsappMsg)}`;

  return (
    <section className="py-20 bg-navy-900 relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          {/* Image Column */}
          <div className="w-full lg:w-5/12 relative">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden border-2 border-gold-500/30 shadow-[0_0_40px_rgba(212,175,55,0.15)] group">
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent z-10 transition-opacity group-hover:opacity-60" />
              <Image 
                src="/aymen-boulabeiz.jpg" 
                alt="Aymen Boulabeiz - Founder"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              <div className="absolute bottom-6 left-6 right-6 z-20 bg-navy-950/80 backdrop-blur-md border border-gold-500/30 rounded-2xl p-4 flex flex-col items-center text-center">
                <span className="text-white font-bold text-xl mb-1">Aymen Boulabeiz</span>
                <span className="text-gold-400 text-sm font-medium">{data.role}</span>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="w-full lg:w-7/12 flex flex-col text-white">
            <div className={cn("inline-flex items-center space-x-2 space-x-reverse mb-4", !isAr && "space-x-reverse-0")}>
              <span className="w-12 h-[2px] bg-gold-500 rounded-full"></span>
              <span className="text-gold-400 font-semibold tracking-wider uppercase text-sm">{data.subheading}</span>
            </div>
            
            <h2 className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight",
              isAr ? "font-arabic" : ""
            )}>
              {data.heading}
            </h2>

            <div className="space-y-6 text-gray-300 text-lg leading-relaxed mb-10">
              {data.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {data.badges.map((badge, idx) => (
                <div key={idx} className="flex flex-col gap-3 bg-navy-800/50 rounded-xl p-4 border border-navy-700 hover:border-gold-500/30 transition-colors">
                  <div className="bg-gold-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <badge.icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <span className="text-sm font-medium text-white">{badge.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Button asChild size="lg" variant="whatsapp" className="gap-2 w-full sm:w-auto shadow-lg shadow-emerald-900/20">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  {data.contactBtn}
                </a>
              </Button>
              <Button asChild variant="primary" size="lg" className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold gap-2 w-full sm:w-auto shadow-lg shadow-gold-500/20">
                <Link href={`/${locale}/quote`}>
                  {data.quoteBtn}
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
