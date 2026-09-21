'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SITE_CONFIG } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';

export default function WhatsAppButton() {
  const t = useTranslations('Navigation');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  const whatsappNum = (typeof (t as any).has === 'function' && (t as any).has('whatsappNumber'))
    ? t('whatsappNumber')
    : SITE_CONFIG.whatsapp;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-2"
        >
          <a
            href={getWhatsAppUrl(whatsappNum, t('whatsappMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping" />
            
            <MessageCircle className="relative z-10 w-7 h-7" />
            
            {/* Tooltip on hover */}
            <span className="absolute end-full me-4 px-3 py-1.5 bg-navy-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
              {t('contactUs')}
            </span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
