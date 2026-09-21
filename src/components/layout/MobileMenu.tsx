'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { cn, getWhatsAppUrl, getCallUrl } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/constants';
import LanguageSelector from './LanguageSelector';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
}

export default function MobileMenu({ isOpen, onClose, navLinks }: MobileMenuProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const whatsappNum = (typeof (t as any).has === 'function' && (t as any).has('whatsappNumber'))
    ? t('whatsappNumber')
    : SITE_CONFIG.whatsapp;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-40"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }} // Note: will need adjustment for RTL if full RTL support is required for sliding direction
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 end-0 bottom-0 w-4/5 max-w-sm bg-navy-900 border-s border-navy-800 z-50 overflow-y-auto flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-navy-800">
              <LanguageSelector />
              <button
                onClick={onClose}
                className="p-2 text-cream-50 hover:text-gold-400 bg-navy-800 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-6 flex flex-col gap-4 flex-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    onClick={onClose}
                    className={cn(
                      "text-lg font-medium transition-colors py-2 border-b border-navy-800/50",
                      isActive ? "text-gold-500" : "text-cream-50 hover:text-gold-400"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-navy-800 flex flex-col gap-4">
              <Link
                href="/quote"
                onClick={onClose}
                className="w-full py-3 px-4 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-md text-center transition-colors"
              >
                {t('getQuote')}
              </Link>
              <div className="flex gap-4">
                <a
                  href={getWhatsAppUrl(whatsappNum, t('whatsappMessage'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20b858] text-white font-bold rounded-md text-center transition-colors flex justify-center items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href={getCallUrl(SITE_CONFIG.phone)}
                  className="p-3 bg-navy-800 hover:bg-navy-700 text-cream-50 rounded-md text-center transition-colors flex justify-center items-center"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>

              <Link
                href="/admin"
                onClick={onClose}
                className="text-center text-xs text-gold-400/80 hover:text-gold-300 py-1 font-medium transition-colors"
              >
                🔐 Espace Connexion Administration
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
