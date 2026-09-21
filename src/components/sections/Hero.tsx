'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown } from 'lucide-react';
import { HERO_IMAGES, SITE_CONFIG } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';

export function Hero() {
  const t = useTranslations();

  const tagline = (typeof (t as any).has === 'function' && (t as any).has('Hero.badge'))
    ? t('Hero.badge')
    : SITE_CONFIG.tagline;

  const whatsappNum = (typeof (t as any).has === 'function' && (t as any).has('Hero.whatsappNumber'))
    ? t('Hero.whatsappNumber')
    : SITE_CONFIG.whatsapp;

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_IMAGES.main}
          alt="Dubai Skyline"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-navy-900/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-start justify-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge className="bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 border-gold-500/50 mb-6">
              {tagline}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="heading-1 text-white text-balance mb-6"
          >
            {t('Hero.headline')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-body text-cream-100 max-w-2xl mb-10"
          >
            {t('Hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/quote">
              <Button size="lg" variant="primary" className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold border-0">
                {t('Hero.ctaPrimary')}
              </Button>
            </Link>
            
            <a href={getWhatsAppUrl(whatsappNum)} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="whatsapp">
                {t('Hero.ctaSecondary')}
              </Button>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </motion.div>
    </section>
  );
}

