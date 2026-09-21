"use client";

import { useLocale } from "next-intl";
import { Sparkles, MessageCircle } from "lucide-react";

const promoData = {
  fr: {
    heading: "Offre Exclusive : Forfait Séjour VIP & Location Véhicule",
    description: "Profitez de réductions exceptionnelles sur nos forfaits combinés. Bénéficiez d'un séjour de luxe avec location de voiture prestige incluse, pensé spécialement pour votre confort à Dubaï.",
    cta: "Réserver cette offre",
    whatsappText: "Bonjour, je souhaite réserver l'offre exclusive Forfait Séjour VIP & Location Véhicule."
  },
  en: {
    heading: "Exclusive Offer : VIP Stay & Luxury Car Package",
    description: "Take advantage of exceptional discounts on our combined packages. Enjoy a luxury stay with a prestige car rental included, designed specifically for your comfort in Dubai.",
    cta: "Book this offer",
    whatsappText: "Hello, I would like to book the exclusive VIP Stay & Luxury Car Package."
  },
  ar: {
    heading: "عرض حصري : باقة الإقامة الفاخرة وتأجير السيارات",
    description: "استفد من خصومات استثنائية على باقاتنا المدمجة. استمتع بإقامة فاخرة مع سيارة فخمة مستأجرة مشمولة، مصممة خصيصاً لراحتك في دبي.",
    cta: "احجز هذا العرض",
    whatsappText: "مرحباً، أود حجز العرض الحصري: باقة الإقامة الفاخرة وتأجير السيارات."
  }
};

export function PromoSection() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const content = promoData[locale as keyof typeof promoData] || promoData.en;

  const whatsappUrl = `https://wa.me/971543770253?text=${encodeURIComponent(content.whatsappText)}`;

  return (
    <section className="py-16" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Luxury background with gold gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-black z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold-600/10 via-transparent to-transparent z-0" />
          
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gold-500/20 rounded-full mb-6 border border-gold-500/30">
              <Sparkles className="w-6 h-6 text-gold-400" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {content.heading}
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
              {content.description}
            </p>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-bold rounded-full hover:from-gold-400 hover:to-gold-500 transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5"
            >
              <MessageCircle className="w-6 h-6" />
              <span>{content.cta}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
