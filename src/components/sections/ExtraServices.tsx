'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { SITE_CONFIG } from '@/lib/constants';
import Link from 'next/link';
import { MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXTRA_SERVICES = [
  { key: 'qatarVisa', slug: 'visa', icon: '🇶🇦' },
  { key: 'omanVisa', slug: 'visa', icon: '🇴🇲' },
  { key: 'saudiVisa', slug: 'visa', icon: '🇸🇦' },
  { key: 'flightBooking', slug: 'flights', icon: '✈️' },
  { key: 'hotelBooking', slug: 'hotels', icon: '🏨' },
  { key: 'carRental', slug: 'cars', icon: '🚗' },
  { key: 'travelServices', slug: 'tourism', icon: '📄' },
] as const;

export default function ExtraServices() {
  const t = useTranslations('ExtraServices');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const whatsappNumber = SITE_CONFIG.whatsapp.replace(/[^0-9]/g, '');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section 
      className="py-20 bg-gradient-to-b from-[#0B1A2F] to-[#061120] text-white"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#D4AF37]">
            {t('title')}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {EXTRA_SERVICES.map((service) => (
            <motion.div
              key={service.key}
              variants={itemVariants}
              className={cn(
                "bg-[#112240] rounded-2xl p-6 sm:p-8 border border-[#233554]",
                "hover:border-[#D4AF37] transition-all duration-300",
                "group relative overflow-hidden"
              )}
            >
              <div className="text-5xl mb-6">
                {service.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#D4AF37] transition-colors">
                {t(`${service.key}.title`)}
              </h3>
              
              <p className="text-gray-400 mb-8 line-clamp-3">
                {t(`${service.key}.description`)}
              </p>
              
              <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/${locale}/quote?service=${service.slug}`}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center px-4 py-2.5",
                    "bg-[#D4AF37] hover:bg-[#C5A030] text-[#0A192F] font-semibold rounded-lg",
                    "transition-colors duration-300 text-sm"
                  )}
                >
                  {t('cta')}
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 ml-2" />
                  )}
                </Link>
                
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t(`${service.key}.title`))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex-1 inline-flex items-center justify-center px-4 py-2.5",
                    "bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]",
                    "border border-[#25D366]/50 hover:border-[#25D366]",
                    "font-medium rounded-lg transition-colors duration-300 text-sm"
                  )}
                >
                  <MessageCircle className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('whatsappCta')}
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
