'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, Zap, Globe, Users, MessageSquare, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const ADVANTAGES = [
  { key: 'professionalService', icon: Shield },
  { key: 'fastResponse', icon: Zap },
  { key: 'expertise', icon: Globe },
  { key: 'personalized', icon: Users },
  { key: 'transparent', icon: MessageSquare },
  { key: 'completeSolutions', icon: Briefcase },
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

export function WhyChooseUs() {
  const t = useTranslations();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-navy-900 py-20 lg:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 inline-block relative">
            {t('WhyChooseUs.title')}
            <span className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-gold-500 rounded-full" />
          </h2>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {ADVANTAGES.map((adv) => {
            const Icon = adv.icon;
            return (
              <motion.div
                key={adv.key}
                variants={itemVariants}
                className="group p-6 bg-navy-800/50 hover:bg-navy-800 border-s-2 border-gold-500/50 hover:border-gold-500 transition-all duration-300 rounded-e-lg"
              >
                <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-gold-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t(`WhyChooseUs.${adv.key}.title`)}
                </h3>
                <p className="text-cream-100 text-sm leading-relaxed">
                  {t(`WhyChooseUs.${adv.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
