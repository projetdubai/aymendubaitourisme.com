"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutGrid, Maximize2 } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

interface Airline {
  name: string;
  nameAr: string;
  iata: string;
  flag: string;
  accentColor: string;
}

const BAR_1: Airline[] = [
  { name: "Emirates", nameAr: "طيران الإمارات", iata: "EK", flag: "🇦🇪", accentColor: "#D71920" },
  { name: "flydubai", nameAr: "فلاي دبي", iata: "FZ", flag: "🇦🇪", accentColor: "#F47920" },
  { name: "Qatar Airways", nameAr: "الخطوط الجوية القطرية", iata: "QR", flag: "🇶🇦", accentColor: "#5C0632" },
  { name: "Saudia", nameAr: "الخطوط السعودية", iata: "SV", flag: "🇸🇦", accentColor: "#004F2F" },
  { name: "Turkish Airlines", nameAr: "الخطوط الجوية التركية", iata: "TK", flag: "🇹🇷", accentColor: "#C30019" },
  { name: "EgyptAir", nameAr: "مصر للطيران", iata: "MS", flag: "🇪🇬", accentColor: "#002B5E" },
  { name: "Gulf Air", nameAr: "طيران الخليج", iata: "GF", flag: "🇧🇭", accentColor: "#B78A3A" },
  { name: "Oman Air", nameAr: "الطيران العماني", iata: "WY", flag: "🇴🇲", accentColor: "#007A9E" },
  { name: "Kuwait Airways", nameAr: "الخطوط الجوية الكويتية", iata: "KU", flag: "🇰🇼", accentColor: "#0053A0" },
  { name: "Air Arabia", nameAr: "العربية للطيران", iata: "G9", flag: "🇦🇪", accentColor: "#E20000" },
  { name: "Pegasus Airlines", nameAr: "طيران بيجاسوس", iata: "PC", flag: "🇹🇷", accentColor: "#FFC72C" },
  { name: "Royal Jordanian", nameAr: "الملكية الأردنية", iata: "RJ", flag: "🇯🇴", accentColor: "#DA291C" },
  { name: "Aeroflot", nameAr: "إيروفلوت", iata: "SU", flag: "🇷🇺", accentColor: "#0039A6" },
  { name: "Etihad Airways", nameAr: "الاتحاد للطيران", iata: "EY", flag: "🇦🇪", accentColor: "#C2A676" },
  { name: "Jazeera Airways", nameAr: "طيران الجزيرة", iata: "J9", flag: "🇰🇼", accentColor: "#00244C" },
];

const BAR_2: Airline[] = [
  { name: "IndiGo", nameAr: "إنديجو", iata: "6E", flag: "🇮🇳", accentColor: "#001B94" },
  { name: "Vistara", nameAr: "فيستارا", iata: "UK", flag: "🇮🇳", accentColor: "#3F265D" },
  { name: "SpiceJet", nameAr: "سبايس جيت", iata: "SG", flag: "🇮🇳", accentColor: "#ED1C24" },
  { name: "Air India", nameAr: "طيران الهند", iata: "AI", flag: "🇮🇳", accentColor: "#E31837" },
  { name: "SriLankan Airlines", nameAr: "الخطوط السريلانكية", iata: "UL", flag: "🇱🇰", accentColor: "#0073B2" },
  { name: "Malaysia Airlines", nameAr: "الخطوط الجوية الماليزية", iata: "MH", flag: "🇲🇾", accentColor: "#002B5E" },
  { name: "Thai Airways", nameAr: "الخطوط الجوية التايلاندية", iata: "TG", flag: "🇹🇭", accentColor: "#4B0082" },
  { name: "Singapore Airlines", nameAr: "الخطوط الجوية السنغافورية", iata: "SQ", flag: "🇸🇬", accentColor: "#002266" },
  { name: "China Eastern", nameAr: "تشاينا إيسترن", iata: "MU", flag: "🇨🇳", accentColor: "#E31837" },
  { name: "ANA", nameAr: "أول نيبون إيرويز", iata: "NH", flag: "🇯🇵", accentColor: "#1147A3" },
  { name: "KLM", nameAr: "كيه إل إم", iata: "KL", flag: "🇳🇱", accentColor: "#00A1DE" },
  { name: "British Airways", nameAr: "الخطوط الجوية البريطانية", iata: "BA", flag: "🇬🇧", accentColor: "#012677" },
  { name: "Lufthansa", nameAr: "لوفتهانزا", iata: "LH", flag: "🇩🇪", accentColor: "#05164D" },
  { name: "Swiss", nameAr: "الخطوط الجوية السويسرية", iata: "LX", flag: "🇨🇭", accentColor: "#E3000F" },
  { name: "Air France", nameAr: "الخطوط الجوية الفرنسية", iata: "AF", flag: "🇫🇷", accentColor: "#002157" },
];

export default function AirlinesBars({ locale }: { locale: string }) {
  const [isGrid, setIsGrid] = useState(false);
  const isAr = locale === "ar";
  const isFr = locale === "fr";

  const content = {
    title: isAr ? "جميع الخطوط المتوفرة" : isFr ? "Toutes les Compagnies Aériennes Disponibles" : "All Available Airlines",
    subtitle: isAr
      ? "نحجز لك على كبرى خطوط الطيران الإقليمية والدولية بأفضل الأسعار"
      : isFr
      ? "Nous réservons sur les grandes compagnies régionales et internationales aux meilleurs tarifs"
      : "We book on major regional and international carriers at the best fares",
    toggleGrid: isAr ? "عرض كشبكة" : isFr ? "Voir en grille (30 compagnies)" : "View as Grid (30 Airlines)",
    toggleScroll: isAr ? "عرض متحرك" : isFr ? "Vue défilante" : "View as Marquee",
  };

  const ALL_AIRLINES = [...BAR_1, ...BAR_2];

  const handleAirlineClick = (airline: Airline) => {
    const msg = isAr
      ? `مرحباً، أود حجز رحلة على ${airline.nameAr}`
      : isFr
      ? `Bonjour, je souhaite réserver un vol sur la compagnie ${airline.name}`
      : `Hello, I would like to book a flight on ${airline.name}`;
    window.open(getWhatsAppUrl(SITE_CONFIG.whatsapp, msg), "_blank");
  };

  const AirlineCard = ({ airline }: { airline: Airline }) => (
    <button
      onClick={() => handleAirlineClick(airline)}
      className={cn(
        "flex items-center gap-3.5 bg-white px-4 py-3 rounded-2xl shadow-sm hover:shadow-xl border border-cream-200/70 hover:border-gold-500/60 transition-all duration-300 cursor-pointer group text-start",
        isGrid ? "w-full" : "w-72 min-w-[18rem]"
      )}
    >
      {/* Official Airline Logo Container */}
      <div className="w-14 h-12 rounded-xl bg-white border border-gray-100 p-1.5 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
        <img
          src={`/airlines/${airline.iata}.png`}
          alt={`${airline.name} logo`}
          className="w-full h-full object-contain filter drop-shadow-xs"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentElement) {
              const fallback = document.createElement('div');
              fallback.className = 'w-full h-full flex items-center justify-center text-xs font-black';
              fallback.style.color = airline.accentColor;
              fallback.innerText = airline.iata;
              target.parentElement.appendChild(fallback);
            }
          }}
        />
      </div>

      {/* Names */}
      <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
        <span className="text-sm font-bold text-navy-900 truncate w-full group-hover:text-gold-600 transition-colors">
          {airline.name}
        </span>
        <span className="text-xs text-navy-600/80 font-medium truncate w-full" dir="rtl">
          {airline.nameAr}
        </span>
      </div>

      {/* Flag & IATA badge */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-lg drop-shadow-xs">{airline.flag}</span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-navy-50 text-navy-600 font-mono">
          {airline.iata}
        </span>
      </div>
    </button>
  );

  return (
    <section className="py-16 bg-cream-50/50 overflow-hidden">
      <style jsx>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 40s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 40s linear infinite;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-start">
            <h2 className="heading-3 text-navy-900 mb-2">{content.title}</h2>
            <p className="text-navy-700">{content.subtitle}</p>
          </div>
          <button
            onClick={() => setIsGrid(!isGrid)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gold-500/30 text-navy-900 text-sm font-medium hover:bg-gold-500/10 transition-colors"
          >
            {isGrid ? <Maximize2 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            {isGrid ? content.toggleScroll : content.toggleGrid}
          </button>
        </div>
      </div>

      {isGrid ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ALL_AIRLINES.map((airline, idx) => (
              <div key={idx} className="flex w-full">
                <AirlineCard airline={airline} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bar 1 (Slides Left) */}
          <div className="flex overflow-hidden relative group">
            <div className="flex gap-6 w-max animate-marquee-left hover:[animation-play-state:paused] px-3">
              {[...BAR_1, ...BAR_1].map((airline, idx) => (
                <AirlineCard key={`bar1-${idx}`} airline={airline} />
              ))}
            </div>
          </div>

          {/* Bar 2 (Slides Right) */}
          <div className="flex overflow-hidden relative group">
            <div className="flex gap-6 w-max animate-marquee-right hover:[animation-play-state:paused] px-3">
              {[...BAR_2, ...BAR_2].map((airline, idx) => (
                <AirlineCard key={`bar2-${idx}`} airline={airline} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
