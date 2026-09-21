'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Plane, 
  Hotel, 
  Car, 
  Building2, 
  Compass, 
  Anchor, 
  ShieldCheck 
} from 'lucide-react';
import { TourismServiceItem } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const ICONS_MAP: Record<string, any> = {
  FileText,
  Plane,
  Hotel,
  Car,
  Building2,
  Compass,
  Anchor,
  ShieldCheck,
  Sparkles,
};

interface CustomServicesGridProps {
  services: TourismServiceItem[];
  locale: string;
}

export default function CustomServicesGrid({ services, locale }: CustomServicesGridProps) {
  const isAr = locale === 'ar';
  const isFr = locale === 'fr';

  const activeServices = services.filter((s) => s.active).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (activeServices.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-cream-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-gold-500/20 text-gold-600 border-gold-500/40 mb-3 px-3 py-1">
            {isAr ? 'كتالوج الخدمات المتكامل' : isFr ? 'Prestations & Services de Luxe' : 'Full Luxury Services Catalog'}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-navy-900 mb-4 tracking-tight">
            {isAr ? 'خدمات أيمن دبي الحصرية' : isFr ? 'Nos Prestations d’Excellence à Dubaï' : 'Exclusive Dubai Travel Experiences'}
          </h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full mb-6" />
          <p className="text-navy-700 text-lg leading-relaxed">
            {isAr
              ? 'حلول شاملة ومتكاملة تلبي كافة تطلعاتكم: تأشيرات، رحلات طيران، إقامات فاخرة، سيارات رياضية، عقارات وأنشطة سياحية استثنائية.'
              : isFr
              ? 'Des solutions sur-mesure pour sublimer votre séjour à Dubaï : visas garantis, vols optimisés, palaces, supercars, immobilier et excursions d’exception.'
              : 'End-to-end bespoke concierge solutions: fast visas, premier flights, 5-star hotels, luxury fleet, prestigious real estate, and safari excursions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {activeServices.map((service, index) => {
            const Icon = ICONS_MAP[service.iconName] || Sparkles;
            const title = isAr ? (service.title?.ar || service.title?.fr) : isFr ? (service.title?.fr || service.title?.en) : (service.title?.en || service.title?.fr);
            const subtitle = isAr ? (service.subtitle?.ar || service.subtitle?.fr) : isFr ? (service.subtitle?.fr || service.subtitle?.en) : (service.subtitle?.en || service.subtitle?.fr);
            const badge = isAr ? (service.badge?.ar || service.badge?.fr) : isFr ? (service.badge?.fr || service.badge?.en) : (service.badge?.en || service.badge?.fr);
            const features = isAr ? (service.features?.ar || service.features?.fr) : isFr ? (service.features?.fr || service.features?.en) : (service.features?.en || service.features?.fr);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex"
              >
                <Card className="flex flex-col justify-between overflow-hidden group hover:-translate-y-2 transition-all duration-300 w-full bg-white shadow-md hover:shadow-2xl rounded-2xl border border-cream-200">
                  <div>
                    {/* Image Header */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-navy-950">
                      {service.image && (
                        <Image
                          src={service.image}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />

                      {/* Icon */}
                      <div className="absolute -bottom-5 end-5 w-11 h-11 bg-gold-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10 text-navy-900 group-hover:rotate-6 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Badge */}
                      {badge && (
                        <div className="absolute top-3 start-3">
                          <span className="px-2.5 py-1 bg-navy-900/90 text-gold-400 border border-gold-500/30 text-[11px] font-black rounded-md shadow-md uppercase">
                            {badge}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-7">
                      <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors line-clamp-1">
                        {title}
                      </h3>

                      {service.priceStartingFrom && (
                        <div className="mb-3 flex items-baseline gap-1.5">
                          <span className="text-[11px] text-navy-600 font-bold uppercase">{isAr ? 'ابتداءً من :' : isFr ? 'Dès' : 'From'}</span>
                          <span className="text-base font-black text-gold-600">{service.priceStartingFrom}</span>
                        </div>
                      )}

                      <p className="text-navy-700 text-xs mb-4 line-clamp-3 leading-relaxed">
                        {subtitle}
                      </p>

                      {/* Features */}
                      {features && features.length > 0 && (
                        <ul className="space-y-1.5 mb-6">
                          {features.slice(0, 3).map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-navy-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="p-6 pt-0 border-t border-cream-100 flex items-center justify-between gap-3">
                    <Button asChild variant="ghost" className="text-navy-900 hover:text-gold-600 hover:bg-gold-50 px-0 h-auto py-2 text-xs font-bold">
                      <Link href={service.ctaLink || '/quote'} className="flex items-center gap-1.5">
                        <span>{isAr ? 'تفاصيل أكثر' : isFr ? 'En savoir plus' : 'Learn more'}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild variant="primary" className="bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all">
                      <Link href={`/quote?service=${service.slug}`}>
                        {isAr ? 'طلب عرض' : isFr ? 'Devis' : 'Quote'}
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
