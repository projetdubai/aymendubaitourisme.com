'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, Instagram, Facebook, Youtube, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SITE_CONFIG } from '@/lib/constants';
import { getWhatsAppUrl, getCallUrl, getEmailUrl, cn } from '@/lib/utils';

// Snapchat icon component
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.016 2.003c-3.15 0-5.467 2.094-5.467 5.176 0 .68.175 1.397.478 2.023-.717.303-1.442.742-1.905 1.411-.383.553-.306 1.246.183 1.677.72.633 1.676.84 2.516.818.232 1.077.868 2.247 1.872 2.997-.935.502-2.028.892-3.157 1.121-.502.102-.857.561-.74 1.066.115.495.6.819 1.107.712 1.673-.34 3.255-1.01 4.513-2.052.825.485 1.777.74 2.745.74.968 0 1.92-.255 2.745-.74 1.258 1.042 2.84 1.712 4.513 2.052.507.107.992-.217 1.107-.712.117-.505-.238-.964-.74-1.066-1.129-.229-2.222-.619-3.157-1.121 1.004-.75 1.64-1.92 1.872-2.997.84.022 1.796-.185 2.516-.818.489-.431.566-1.124.183-1.677-.463-.669-1.188-1.108-1.905-1.411.303-.626.478-1.343.478-2.023 0-3.082-2.317-5.176-5.467-5.176z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.69 3.96-2.07 5.37-1.57 1.62-3.9 2.37-6.07 1.86-2.22-.51-4.04-2.18-4.73-4.36-.67-2.12-.2-4.52 1.25-6.22 1.51-1.78 3.94-2.58 6.16-2.02v4.14c-1.18-.17-2.45.2-3.28 1.1-.9.98-1.06 2.55-.38 3.7.67 1.12 2.06 1.63 3.3 1.27 1.22-.35 2.04-1.44 2.15-2.73V.02h-.41z"/>
  </svg>
);

export function Contact() {
  const t = useTranslations('Contact');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        setFormStatus('error');
        setTimeout(() => setFormStatus('idle'), 4000);
      }
    } catch {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  const tFooter = useTranslations('Footer');
  const hasKey = (key: string) => typeof (tFooter as any).has === 'function' && (tFooter as any).has(key);
  const contactPhone = hasKey('phone') ? tFooter('phone') : SITE_CONFIG.contact.phone;
  const contactWhatsapp = hasKey('whatsapp') ? tFooter('whatsapp') : SITE_CONFIG.contact.whatsapp;
  const contactEmail = hasKey('email') ? tFooter('email') : SITE_CONFIG.contact.email;

  const instagramUrl = hasKey('instagram') ? tFooter('instagram') : SITE_CONFIG.social.instagram;
  const tiktokUrl = hasKey('tiktok') ? tFooter('tiktok') : SITE_CONFIG.social.tiktok;
  const snapchatUrl = hasKey('snapchat') ? tFooter('snapchat') : SITE_CONFIG.social.snapchat;
  const facebookUrl = hasKey('facebook') ? tFooter('facebook') : SITE_CONFIG.social.facebook;
  const youtubeUrl = hasKey('youtube') ? tFooter('youtube') : SITE_CONFIG.social.youtube;

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: instagramUrl, color: 'hover:text-pink-500' },
    { name: 'TikTok', icon: TikTokIcon, url: tiktokUrl, color: 'hover:text-black' },
    { name: 'YouTube', icon: Youtube, url: youtubeUrl, color: 'hover:text-red-500' },
    { name: 'Facebook', icon: Facebook, url: facebookUrl, color: 'hover:text-blue-600' },
    { name: 'Snapchat', icon: SnapchatIcon, url: snapchatUrl, color: 'hover:text-[#FFFC00]' },
  ].filter(s => Boolean(s.url));

  return (
    <section className="py-16 md:py-24 bg-cream-50" id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              {t('title', { fallback: 'Get In Touch' })}
            </h2>
            <p className="text-navy-700 max-w-2xl mx-auto">
              {t('subtitle', { fallback: 'Have questions or ready to book your Dubai experience? Contact our team today.' })}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information Cards */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <Card className="p-6 bg-white border-cream-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-gold-50 p-3 rounded-full text-gold-500">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy-900 mb-2">{t('phone.title', { fallback: 'Call Us' })}</h3>
                  <p className="text-navy-700 mb-4 font-medium text-lg" dir="ltr">{contactPhone}</p>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => window.open(getCallUrl(contactPhone), '_self')}
                  >
                    {t('phone.action', { fallback: 'Call Now' })}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-cream-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-3 rounded-full text-green-500">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy-900 mb-2">{t('whatsapp.title', { fallback: 'WhatsApp' })}</h3>
                  <p className="text-navy-700 mb-4" dir="ltr">{contactWhatsapp}</p>
                  <Button 
                    variant="whatsapp" 
                    className="w-full sm:w-auto"
                    onClick={() => window.open(getWhatsAppUrl(contactWhatsapp), '_blank')}
                  >
                    {t('whatsapp.action', { fallback: 'Chat on WhatsApp' })}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-cream-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-full text-blue-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-navy-900 mb-2">{t('email.title', { fallback: 'Email Us' })}</h3>
                  <p className="text-navy-700 mb-4 break-all">{contactEmail}</p>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => window.open(getEmailUrl(contactEmail), '_self')}
                  >
                    {t('email.action', { fallback: 'Send Email' })}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 bg-white border-cream-100 shadow-xl h-full">
              <h3 className="text-2xl font-bold text-navy-900 mb-6">{t('form.title')}</h3>

              {formStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm leading-relaxed">
                  <strong className="block font-bold mb-1">{t('form.successTitle', { fallback: 'Message Sent' })}</strong>
                  {t('form.success', { fallback: 'Thank you for reaching out. We will contact you soon.' })}
                </div>
              )}

              {formStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {tCommon('error', { fallback: 'An error occurred. Please try again.' })}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-navy-800 mb-1">
                    {t('form.name')}
                  </label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('form.namePlaceholder')}
                    className="bg-cream-50"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-800 mb-1">
                      {t('form.email')}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('form.emailPlaceholder')}
                      className="bg-cream-50"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-navy-800 mb-1">
                      {t('form.phone')}
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t('form.phonePlaceholder')}
                      className="bg-cream-50"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-navy-800 mb-1">
                    {t('form.message')}
                  </label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('form.messagePlaceholder')}
                    className="bg-cream-50"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold py-3"
                  disabled={formStatus === 'submitting'}
                >
                  {formStatus === 'submitting' ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
                      {t('form.sending')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {t('form.send')}
                    </span>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>

        {/* Social Media Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-12 border-t border-cream-100/50"
        >
          <h3 className="text-center text-lg font-medium text-navy-800 mb-6">
            {t('followUs', { fallback: 'Follow us on social media' })}
          </h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300",
                    "hover:bg-white hover:shadow-md text-navy-700",
                    social.color
                  )}
                >
                  <Icon className="w-8 h-8" />
                  <span className="text-sm font-medium">{social.name}</span>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
