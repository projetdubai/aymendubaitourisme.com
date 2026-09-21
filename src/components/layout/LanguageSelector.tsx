'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, locales, type Locale } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const languages: Record<Locale, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇬🇧' },
  ar: { name: 'العربية', flag: '🇦🇪' },
  fr: { name: 'Français', flag: '🇫🇷' },
};

export default function LanguageSelector() {
  const t = useTranslations('Navigation');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cream-50 hover:text-gold-400 transition-colors rounded-md hover:bg-navy-800"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{languages[locale].flag}</span>
        <span className="hidden md:inline-block uppercase">{locale}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute end-0 mt-2 w-40 bg-navy-800 border border-navy-700 rounded-md shadow-lg overflow-hidden z-50"
          >
            <div className="py-1">
              {(Object.keys(languages) as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLanguage(loc)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-2 text-start text-sm transition-colors",
                    locale === loc ? "bg-navy-700 text-gold-400 font-semibold" : "text-cream-50 hover:bg-navy-700 hover:text-gold-300"
                  )}
                >
                  <span className="text-lg">{languages[loc].flag}</span>
                  {languages[loc].name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
