'use client';

import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Users, Gauge, Car, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CarItem } from '@/lib/cars';
import { getWhatsAppUrl, cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/constants';

interface ImageCarouselModalProps {
  car: CarItem | null;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function ImageCarouselModal({ car, isOpen, onClose, locale }: ImageCarouselModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isAr = locale === 'ar';
  const isFr = locale === 'fr';

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !car) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, car, currentIndex]);

  if (!isOpen || !car) return null;

  const images = (car.images && car.images.length > 0) ? car.images : (car.image ? [car.image] : []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getWhatsAppMessage = () => {
    if (isAr) return `مرحباً، أود الاستفسار عن حجز سيارة ${car.name} (${car.pricePerDay}) المعروضة في موقع أيمن دبي للسياحة.`;
    if (isFr) return `Bonjour, je souhaite réserver la voiture ${car.name} (${car.pricePerDay}) vue sur le site AYMEN DUBAI TOURISME.`;
    return `Hello, I would like to inquire about booking the ${car.name} (${car.pricePerDay}) from AYMEN DUBAI TOURISME website.`;
  };

  const whatsappUrl = getWhatsAppUrl(SITE_CONFIG.whatsapp, getWhatsAppMessage());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/90 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-navy-900">{car.name}</h3>
            <p className="text-sm text-gray-500">{car.brand} • {car.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
          {/* Main Image & Thumbnails */}
          <div className="flex-1 p-4 flex flex-col gap-4">
            <div className="relative aspect-video w-full bg-gray-100 rounded-xl overflow-hidden group">
              <img
                src={images[currentIndex]}
                alt={`${car.name} - ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={isAr ? handleNext : handlePrev}
                    className={cn("absolute top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-navy-900 rounded-full shadow-md transition-all cursor-pointer", isAr ? "right-4" : "left-4")}
                  >
                    {isAr ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                  </button>
                  <button
                    onClick={isAr ? handlePrev : handleNext}
                    className={cn("absolute top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-navy-900 rounded-full shadow-md transition-all cursor-pointer", isAr ? "left-4" : "right-4")}
                  >
                    {isAr ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                  </button>
                </>
              )}
              
              <div className="absolute top-4 right-4 px-3 py-1 bg-navy-900/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "relative shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                      currentIndex === idx ? "border-gold-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col gap-6 bg-cream-50/50">
            {/* Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3">
                <div className="bg-gold-500/10 p-2 rounded-lg text-gold-600">
                  <Gauge size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">{isAr ? 'ناقل الحركة' : isFr ? 'Transmission' : 'Transmission'}</p>
                  <p className="text-sm font-bold text-navy-900">{car.transmission}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3">
                <div className="bg-gold-500/10 p-2 rounded-lg text-gold-600">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">{isAr ? 'المقاعد' : isFr ? 'Sièges' : 'Seats'}</p>
                  <p className="text-sm font-bold text-navy-900">{car.seats}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3">
                <div className="bg-gold-500/10 p-2 rounded-lg text-gold-600">
                  <Car size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">{isAr ? 'المحرك' : isFr ? 'Moteur' : 'Engine'}</p>
                  <p className="text-sm font-bold text-navy-900">{car.engine || 'V8'}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3">
                <div className="bg-gold-500/10 p-2 rounded-lg text-gold-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">{isAr ? 'تأمين' : isFr ? 'Assurance' : 'Insurance'}</p>
                  <p className="text-sm font-bold text-navy-900">{isAr ? 'شامل' : isFr ? 'Inclus' : 'Included'}</p>
                </div>
              </div>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-navy-900 mb-3">{isAr ? 'المميزات' : isFr ? 'Caractéristiques' : 'Features'}</h4>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feat, idx) => (
                    <Badge key={idx} variant="default" className="bg-white text-navy-700 border-gray-200">
                      {feat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing & CTA */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="mb-4">
                <p className="text-sm text-gray-500">{isAr ? 'السعر ابتداءً من:' : isFr ? 'À partir de :' : 'Starting from:'}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gold-600">{car.pricePerDay}</span>
                  <span className="text-sm text-gray-500">{isAr ? '/ يوم' : isFr ? '/ jour' : '/ day'}</span>
                </div>
              </div>
              
              <Button asChild variant="whatsapp" className="w-full py-6 text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  {isAr ? 'احجز الآن عبر واتساب' : isFr ? 'Réserver maintenant' : 'Book Now via WhatsApp'}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
