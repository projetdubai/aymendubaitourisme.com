'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  FileText, 
  FileClock, 
  Hotel, 
  Plane, 
  Car, 
  Compass, 
  Building2,
  Sparkles,
  ShieldCheck,
  Anchor
} from 'lucide-react';
import { SERVICE_IMAGES } from '@/lib/constants';
import { TourismServiceItem } from '@/lib/services';

const ICONS_MAP: Record<string, any> = {
  FileText,
  FileClock,
  Hotel,
  Plane,
  Car,
  Compass,
  Building2,
  Sparkles,
  ShieldCheck,
  Anchor,
};

const DEFAULT_SERVICES_LIST = [
  { slug: 'visa', icon: FileText, imageKey: 'visa', translationKey: 'dubaiVisa' },
  { slug: 'visa-extension', icon: FileClock, imageKey: 'visaExtension', translationKey: 'visaExtension' },
  { slug: 'hotels', icon: Hotel, imageKey: 'hotels', translationKey: 'hotelBooking' },
  { slug: 'flights', icon: Plane, imageKey: 'flights', translationKey: 'flightBooking' },
  { slug: 'cars', icon: Car, imageKey: 'cars', translationKey: 'carRental' },
  { slug: 'tourism', icon: Compass, imageKey: 'tourism', translationKey: 'tourism' },
  { slug: 'real-estate', icon: Building2, imageKey: 'realEstate', translationKey: 'realEstate' },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface ServicesProps {
  initialServices?: TourismServiceItem[];
  locale?: string;
}

export function Services({ initialServices, locale: propLocale }: ServicesProps) {
  const t = useTranslations();
  const hookLocale = useLocale();
  const currentLocale = (propLocale || hookLocale || 'fr') as 'fr' | 'ar' | 'en';
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const dynamicActiveServices = initialServices && initialServices.length > 0
    ? initialServices.filter((s) => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
    : null;

  return (
    <section className="bg-cream-50 py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4 inline-block relative">
            {t('Services.title')}
            <span className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-gold-500 rounded-full" />
          </h2>
          <p className="text-navy-700 mt-6 text-lg">
            {t('Services.subtitle')}
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {dynamicActiveServices
            ? dynamicActiveServices.map((service, index) => {
                const Icon = ICONS_MAP[service.iconName] || Sparkles;
                const isLastOdd = dynamicActiveServices.length % 2 !== 0 && index === dynamicActiveServices.length - 1;
                const title = service.title?.[currentLocale] || service.title?.fr || service.title?.en || service.slug;
                const description = service.description?.[currentLocale] || service.subtitle?.[currentLocale] || service.description?.fr || '';
                const badge = service.badge?.[currentLocale] || service.badge?.fr;
                const imgSrc = service.image || SERVICE_IMAGES[service.slug as keyof typeof SERVICE_IMAGES] || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop';
                const learnMoreHref = service.ctaLink || `/${service.slug}`;
                const quoteHref = `/quote?service=${encodeURIComponent(service.slug)}`;

                return (
                  <motion.div 
                    key={service.id || service.slug} 
                    variants={itemVariants}
                    className={`flex ${isLastOdd ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''}`}
                  >
                    <Card className="flex flex-col overflow-hidden group hover:-translate-y-2 transition-transform duration-300 w-full bg-white shadow-md hover:shadow-xl rounded-2xl border border-cream-100">
                      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-2xl">
                        <Image
                          src={imgSrc}
                          alt={title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {badge && (
                          <div className="absolute top-3 end-3 z-10">
                            <Badge className="bg-gold-500 text-navy-900 font-semibold px-2.5 py-0.5 shadow-md">
                              {badge}
                            </Badge>
                          </div>
                        )}
                        <div className="absolute -bottom-6 end-6 w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow pt-8">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-xl font-bold text-navy-900">
                            {title}
                          </h3>
                          {service.priceStartingFrom && (
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-cream-100 text-gold-600 shrink-0">
                              {service.priceStartingFrom}
                            </span>
                          )}
                        </div>
                        <p className="text-navy-700 text-sm mb-6 flex-grow leading-relaxed">
                          {description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto gap-4 pt-2 border-t border-cream-100">
                          <Button asChild variant="ghost" className="text-navy-900 hover:text-gold-500 hover:bg-gold-500/10 px-0 h-auto py-2">
                            <Link href={learnMoreHref}>
                              {t('Common.buttons.learnMore')}
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white">
                            <Link href={quoteHref}>
                              {t('Common.buttons.getQuote')}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            : DEFAULT_SERVICES_LIST.map((service, index) => {
                const Icon = service.icon;
                const isLastOdd = DEFAULT_SERVICES_LIST.length % 2 !== 0 && index === DEFAULT_SERVICES_LIST.length - 1;
                
                const hasCustomImg = typeof (t as any).has === 'function' 
                  ? (t as any).has(`Services.${service.translationKey}.image`) 
                  : false;
                const customImg = hasCustomImg ? t(`Services.${service.translationKey}.image`) : '';
                const imgSrc = (customImg && !customImg.includes('Services.')) 
                  ? customImg 
                  : SERVICE_IMAGES[service.imageKey as keyof typeof SERVICE_IMAGES];

                return (
                  <motion.div 
                    key={service.slug} 
                    variants={itemVariants}
                    className={`flex ${isLastOdd ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''}`}
                  >
                    <Card className="flex flex-col overflow-hidden group hover:-translate-y-2 transition-transform duration-300 w-full bg-white shadow-md hover:shadow-xl rounded-2xl border border-cream-100">
                      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-2xl">
                        <Image
                          src={imgSrc}
                          alt={t(`Services.${service.translationKey}.title`)}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute -bottom-6 end-6 w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow pt-8">
                        <h3 className="text-xl font-bold text-navy-900 mb-3">
                          {t(`Services.${service.translationKey}.title`)}
                        </h3>
                        <p className="text-navy-700 text-sm mb-6 flex-grow">
                          {t(`Services.${service.translationKey}.description`)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto gap-4">
                          <Button asChild variant="ghost" className="text-navy-900 hover:text-gold-500 hover:bg-gold-500/10 px-0 h-auto py-2">
                            <Link href={`/${service.slug}`}>
                              {t('Common.buttons.learnMore')}
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white">
                            <Link href={`/quote?service=${service.slug}`}>
                              {t('Common.buttons.getQuote')}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
        </motion.div>
      </div>
    </section>
  );
}

