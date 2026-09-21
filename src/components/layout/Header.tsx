'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Menu, MessageCircle, Lock } from 'lucide-react';
import { cn, getWhatsAppUrl } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/constants';
import LanguageSelector from './LanguageSelector';
import MobileMenu from './MobileMenu';

interface NavItem {
  id: string;
  href: string;
  labelFr: string;
  labelAr: string;
  labelEn: string;
  enabled?: boolean;
  order?: number;
}

export default function Header() {
  const t = useTranslations('Navigation');
  const locale = useLocale() || 'fr';
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoFlashing, setIsLogoFlashing] = useState(false);
  const [customNavItems, setCustomNavItems] = useState<NavItem[] | null>(null);

  useEffect(() => {
    fetch('/api/navbar', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.navbar)) {
          setCustomNavItems(data.navbar);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    setIsLogoFlashing(true);
    setTimeout(() => setIsLogoFlashing(false), 600);
  };

  const navLinks = customNavItems && customNavItems.length > 0
    ? customNavItems
        .filter((item) => item.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((item) => ({
          href: item.href,
          label:
            locale === 'ar'
              ? item.labelAr || item.labelFr
              : locale === 'en'
              ? item.labelEn || item.labelFr
              : item.labelFr,
        }))
    : [
        { href: '/', label: t('home') },
        { href: '/services', label: t('services') },
        { href: '/visa', label: t('visa') },
        { href: '/hotels', label: t('hotels') },
        { href: '/flights', label: t('flights') },
        { href: '/cars', label: t('cars') },
        { href: '/real-estate', label: t('realEstate') },
        { href: '/reviews', label: t('reviews') },
        { href: '/contact', label: t('contact') },
      ];

  const whatsappNum = (typeof (t as any).has === 'function' && (t as any).has('whatsappNumber'))
    ? t('whatsappNumber')
    : SITE_CONFIG.whatsapp;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-300",
          isScrolled ? "bg-navy-900/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-3"
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo agrandi, sans fond noir et avec éclat doré */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className={cn(
                "flex-shrink-0 relative transition-transform duration-200 cursor-pointer select-none gold-click",
                isLogoFlashing && "gold-click-active"
              )}
            >
              {/* Dimensions agrandies : 120px sur mobile, 142px sur desktop */}
              <div className="relative h-[60px] w-[230px] sm:h-[72px] sm:w-[280px]">
                <Image
                  src="/logo.jpeg"
                  alt="AYMEN DUBAI TOURISME"
                  fill
                  sizes="(max-width: 768px) 330px, 480px"
                  /* mix-blend-screen rend le fond noir totalement invisible sur le fond sombre */
                  className="object-contain object-start mix-blend-screen transition-all duration-200"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-gold-400",
                      isActive ? "text-gold-500" : "text-cream-50"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <LanguageSelector />
              
              <a
                href={getWhatsAppUrl(whatsappNum, t('whatsappMessage'))}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#25D366] hover:bg-navy-800 rounded-full transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
              
              <Link
                href="/admin"
                className="p-2 text-cream-50/70 hover:text-gold-400 hover:bg-navy-800 rounded-full transition-colors"
                title="Espace Connexion Administration"
                aria-label="Espace Connexion Administration"
              >
                <Lock className="w-5 h-5" />
              </Link>

              <Link
                href="/quote"
                className="px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold rounded-md transition-all shadow-md hover:shadow-lg"
              >
                {t('getQuote')}
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <a
                href={getWhatsAppUrl(whatsappNum, t('whatsappMessage'))}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#25D366]"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-cream-50 hover:text-gold-400 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />
    </>
  );
}
