'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Car, 
  Users, 
  Gauge, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight,
  Filter,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SITE_CONFIG } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { CarItem } from '@/lib/cars';
import ImageCarouselModal from './ImageCarouselModal';

interface CarFleetSectionProps {
  initialCars: CarItem[];
  locale: string;
}

export default function CarFleetSection({ initialCars, locale }: CarFleetSectionProps) {
  const isAr = locale === 'ar';
  const isFr = locale === 'fr';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalCar, setModalCar] = useState<CarItem | null>(null);

  const categories = [
    { id: 'all', label: isAr ? 'جميع السيارات' : isFr ? 'Toutes les voitures' : 'All Vehicles' },
    { id: 'Supercars & Sportives', label: isAr ? 'سيارات رياضية وسوبركار' : isFr ? 'Supercars & Sportives' : 'Supercars & Sports' },
    { id: 'Luxe & Prestige', label: isAr ? 'فخامة وبريستيج' : isFr ? 'Luxe & Prestige' : 'Luxury & Prestige' },
    { id: 'SUV de Luxe', label: isAr ? 'دفع رباعي فاخر' : isFr ? 'SUV de Luxe' : 'Luxury SUVs' },
    { id: 'SUV Familial', label: isAr ? 'دفع رباعي عائلي' : isFr ? 'SUV Familial' : 'Family SUVs' },
    { id: 'Berlines & Économiques', label: isAr ? 'اقتصادية وعائلية' : isFr ? 'Économiques & Berlines' : 'Economy & Sedans' },
  ];

  const filteredCars = initialCars.filter((car) => {
    if (selectedCategory === 'all') return true;
    return car.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(car.category.toLowerCase());
  });

  const getWhatsAppMessage = (car: CarItem) => {
    if (isAr) {
      return `مرحباً، أود الاستفسار عن حجز سيارة ${car.name} (${car.pricePerDay}) المعروضة في موقع أيمن دبي للسياحة.`;
    }
    if (isFr) {
      return `Bonjour, je souhaite réserver la voiture ${car.name} (${car.pricePerDay}) vue sur le site AYMEN DUBAI TOURISME.`;
    }
    return `Hello, I would like to inquire about booking the ${car.name} (${car.pricePerDay}) from AYMEN DUBAI TOURISME website.`;
  };

  return (
    <section className="py-16 bg-cream-50" id="fleet-catalog">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 text-gold-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} />
            <span>{isAr ? 'أسطول السيارات المتاح للحجز' : isFr ? 'Catalogue Flotte Disponible' : 'Available Fleet for Booking'}</span>
          </div>
          <h2 className="heading-2 text-navy-900 mb-4">
            {isAr 
              ? 'اختر سيارتك الفاخرة وانطلق في شوارع دبي' 
              : isFr 
              ? 'Choisissez Votre Voiture de Rêve à Dubaï' 
              : 'Choose Your Dream Rental Car in Dubai'}
          </h2>
          <p className="text-navy-700 text-sm sm:text-base">
            {isAr
              ? 'توصيل مباشر إلى مطار دبي الدولي أو فندقك. أسعار شفافة وشاملة، تأمين كامل، وخدمة عملاء VIP على مدار 24 ساعة.'
              : isFr
              ? 'Livraison gratuite à l’aéroport de Dubaï ou à votre hôtel. Tarifs clairs et transparents avec assurance et service VIP 24/7.'
              : 'Direct complimentary delivery to Dubai Airport or your luxury hotel. Transparent pricing, full insurance, and 24/7 VIP assistance.'}
          </p>
          <div className="w-20 h-1 bg-gold-500 mx-auto rounded-full mt-5" />
        </div>

        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-navy-900 text-gold-400 shadow-md transform scale-105 border border-gold-500/40'
                    : 'bg-white text-navy-800 hover:bg-cream-100/80 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCars.map((car) => {
            const isAvail = car.status === 'Disponible';
            const whatsappUrl = getWhatsAppUrl(SITE_CONFIG.whatsapp, getWhatsAppMessage(car));
            const carImages = (car.images && car.images.length > 0) ? car.images : (car.image ? [car.image] : []);

            return (
              <Card 
                key={car.id} 
                className="overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group rounded-2xl"
              >
                {/* Photo container */}
                <div 
                  className="relative aspect-16/10 w-full overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => setModalCar(car)}
                >
                  <img
                    src={carImages[0]}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop';
                    }}
                  />

                  {/* Photo count overlay */}
                  {carImages.length > 0 && (
                    <div className="absolute top-3 end-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full hover:bg-black/80 transition-colors">
                      <Camera size={12} />
                      <span>
                        {isAr ? `${carImages.length} صور` : isFr ? `${carImages.length} photos` : `${carImages.length} photos`}
                      </span>
                    </div>
                  )}

                  {/* Status & Featured badges */}
                  <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-10">
                    <span className="px-2.5 py-0.5 bg-green-500 text-white text-[11px] font-bold rounded-full shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {isAr ? 'متوفر فوراً' : isFr ? 'DISPONIBLE' : 'AVAILABLE'}
                    </span>
                    {car.featured && (
                      <span className="px-2.5 py-0.5 bg-gold-500 text-navy-900 text-[10px] font-extrabold rounded-full shadow-sm">
                        ⭐ {isAr ? 'مميز' : isFr ? 'VEDETTE' : 'FEATURED'}
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 end-3 z-10">
                    <span className="px-2.5 py-1 bg-navy-900/80 backdrop-blur-xs text-gold-400 text-[11px] font-semibold rounded-lg">
                      {car.category}
                    </span>
                  </div>
                  
                  {/* View Photos Overlay (visible on hover) */}
                  <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="px-4 py-2 bg-white/90 text-navy-900 text-xs font-bold rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      {isAr ? 'عرض الصور' : isFr ? 'Voir les photos' : 'View Photos'}
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Brand & Name */}
                  <div className="mb-3">
                    <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">
                      {car.brand}
                    </span>
                    <h3 className="text-lg font-bold text-navy-900 group-hover:text-gold-600 transition-colors line-clamp-1">
                      {car.name}
                    </h3>
                  </div>

                  {/* Specs row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs text-navy-800 mb-4 bg-cream-50/50 rounded-lg px-2 text-center">
                    <div>
                      <Gauge size={14} className="mx-auto text-gold-600 mb-0.5" />
                      <span className="truncate block">{car.transmission}</span>
                    </div>
                    <div>
                      <Users size={14} className="mx-auto text-gold-600 mb-0.5" />
                      <span className="truncate block">{car.seats} {isAr ? 'مقاعد' : 'places'}</span>
                    </div>
                    <div>
                      <Car size={14} className="mx-auto text-gold-600 mb-0.5" />
                      <span className="truncate block">{car.engine?.split(' ')[0] || 'V8'}</span>
                    </div>
                  </div>

                  {/* Features Inclusions */}
                  {Array.isArray(car.features) && car.features.length > 0 && (
                    <ul className="space-y-1.5 mb-5 flex-grow text-xs text-navy-700">
                      {car.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-gold-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price display */}
                  <div className="mb-4 pt-2">
                    <p className="text-xs text-gray-500">
                      {isAr ? 'السعر ابتداءً من:' : isFr ? 'À partir de :' : 'Starting from:'}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-navy-900 font-mono text-gold-600">
                        {car.pricePerDay}
                      </span>
                      <span className="text-xs text-gray-500">
                        {isAr ? '/ يوم' : isFr ? '/ jour' : '/ day'}
                      </span>
                    </div>
                    {car.pricePerWeek && (
                      <p className="text-[11px] text-gray-500 font-mono">
                        {car.pricePerWeek} {isAr ? '/ أسبوع' : isFr ? '/ semaine' : '/ week'}
                      </p>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="space-y-2 mt-auto">
                    {/* WhatsApp reservation */}
                    <Button
                      asChild
                      variant="whatsapp"
                      className="w-full text-xs font-bold py-2 shadow-xs flex items-center justify-center gap-2"
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle size={15} />
                        <span>{isAr ? 'حجز فوري عبر واتساب' : isFr ? 'Réserver via WhatsApp' : 'Reserve on WhatsApp'}</span>
                      </a>
                    </Button>

                    {/* Quote button */}
                    <Button
                      asChild
                      variant="outline"
                      className="w-full text-xs font-semibold py-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white transition-colors"
                    >
                      <Link href={`/${locale}/quote?service=cars&car=${encodeURIComponent(car.name)}`}>
                        {isAr ? 'طلب عرض سعر مفصل' : isFr ? 'Demander un devis' : 'Request Quote'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty state if filter has no results */}
        {filteredCars.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
            <Car size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-navy-900 mb-1">
              {isAr ? 'لا توجد سيارات في هذه الفئة حالياً' : 'Aucun véhicule dans cette catégorie pour le moment'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isAr ? 'يرجى اختيار فئة أخرى أو التواصل معنا عبر واتساب لطلب خاص.' : 'Contactez notre service client pour un modèle spécifique sur mesure.'}
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 bg-navy-900 text-gold-400 text-xs font-bold rounded-lg"
            >
              {isAr ? 'عرض جميع السيارات' : 'Afficher toute la flotte'}
            </button>
          </div>
        )}
      </div>

      {/* Image Carousel Modal */}
      <ImageCarouselModal
        car={modalCar}
        isOpen={!!modalCar}
        onClose={() => setModalCar(null)}
        locale={locale}
      />
    </section>
  );
}
