import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Mail, Phone, MapPin, Instagram, Youtube, Facebook } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { getWhatsAppUrl, getCallUrl, getEmailUrl } from '@/lib/utils';

// Custom icons for TikTok and Snapchat
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
  </svg>
);

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.016 2.003c-3.15 0-5.467 2.094-5.467 5.176 0 .68.175 1.397.478 2.023-.717.303-1.442.742-1.905 1.411-.383.553-.306 1.246.183 1.677.72.633 1.676.84 2.516.818.232 1.077.868 2.247 1.872 2.997-.935.502-2.028.892-3.157 1.121-.502.102-.857.561-.74 1.066.115.495.6.819 1.107.712 1.673-.34 3.255-1.01 4.513-2.052.825.485 1.777.74 2.745.74.968 0 1.92-.255 2.745-.74 1.258 1.042 2.84 1.712 4.513 2.052.507.107.992-.217 1.107-.712.117-.505-.238-.964-.74-1.066-1.129-.229-2.222-.619-3.157-1.121 1.004-.75 1.64-1.92 1.872-2.997.84.022 1.796-.185 2.516-.818.489-.431.566-1.124.183-1.677-.463-.669-1.188-1.108-1.905-1.411.303-.626.478-1.343.478-2.023 0-3.082-2.317-5.176-5.467-5.176z"/>
  </svg>
);

export default function Footer() {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navigation');

  const hasKey = (key: string) => typeof (t as any).has === 'function' && (t as any).has(key);
  const displayAddress = hasKey('address') ? t('address') : SITE_CONFIG.address;
  const displayPhone = hasKey('phone') ? t('phone') : SITE_CONFIG.phone;
  const displayEmail = hasKey('email') ? t('email') : SITE_CONFIG.email;
  const displayWhatsapp = hasKey('whatsapp') ? t('whatsapp') : SITE_CONFIG.whatsapp;

  const instagramUrl = hasKey('instagram') ? t('instagram') : SITE_CONFIG.socials.instagram;
  const tiktokUrl = hasKey('tiktok') ? t('tiktok') : SITE_CONFIG.socials.tiktok;
  const snapchatUrl = hasKey('snapchat') ? t('snapchat') : SITE_CONFIG.socials.snapchat;
  const facebookUrl = hasKey('facebook') ? t('facebook') : SITE_CONFIG.socials.facebook;
  const youtubeUrl = hasKey('youtube') ? t('youtube') : SITE_CONFIG.socials.youtube;

  return (
    <footer className="bg-navy-900 text-cream-50 pt-16 pb-6 border-t border-navy-800">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Column 1: Brand & About */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block relative w-[200px] h-[50px]">
              <Image
                src="/logo.jpeg"
                alt="AYMEN DUBAI TOURISME"
                fill
                sizes="200px"
                className="object-contain object-start"
              />
            </Link>
            <p className="text-cream-100/80 text-sm leading-relaxed max-w-sm">
              {t('description')}
            </p>
            <div className="flex items-center gap-4 mt-2">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-navy-800 rounded-full hover:bg-gold-500 hover:text-navy-900 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-navy-800 rounded-full hover:bg-gold-500 hover:text-navy-900 transition-colors">
                  <TikTokIcon className="w-5 h-5" />
                </a>
              )}
              {snapchatUrl && (
                <a href={snapchatUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-navy-800 rounded-full hover:bg-[#FFFC00] hover:text-black transition-colors" title="Snapchat" aria-label="Snapchat">
                  <SnapchatIcon className="w-5 h-5" />
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-navy-800 rounded-full hover:bg-gold-500 hover:text-navy-900 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-navy-800 rounded-full hover:bg-gold-500 hover:text-navy-900 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gold-500 font-bold text-lg mb-2">{t('quickLinks')}</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('home')}</Link></li>
              <li><Link href="/services" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('services')}</Link></li>
              <li><Link href="/reviews" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('reviews')}</Link></li>
              <li><Link href="/contact" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('contact')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gold-500 font-bold text-lg mb-2">{t('services')}</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/visa" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('visa')}</Link></li>
              <li><Link href="/hotels" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('hotels')}</Link></li>
              <li><Link href="/flights" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('flights')}</Link></li>
              <li><Link href="/cars" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('cars')}</Link></li>
              <li><Link href="/real-estate" className="text-cream-100/80 hover:text-gold-400 transition-colors">{tNav('realEstate')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gold-500 font-bold text-lg mb-2">{t('contact')}</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-cream-100/80 text-sm leading-relaxed">{displayAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href={getCallUrl(displayPhone)} dir="ltr" className="text-cream-100/80 hover:text-gold-400 transition-colors">
                  {displayPhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href={getEmailUrl(displayEmail)} className="text-cream-100/80 hover:text-gold-400 transition-colors break-all">
                  {displayEmail}
                </a>
              </li>
            </ul>
            
            <a
              href={getWhatsAppUrl(displayWhatsapp, tNav('whatsappMessage'))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white py-2.5 px-4 rounded-md font-medium transition-colors"
            >
              WhatsApp
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-cream-100/60">
          <p>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gold-400 transition-colors">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-gold-400 transition-colors">{t('terms')}</Link>
            <Link href="/admin" className="hover:text-gold-400 transition-colors text-cream-100/50 hover:text-gold-400">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
