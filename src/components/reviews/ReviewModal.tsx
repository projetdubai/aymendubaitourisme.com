'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { Star, X, CheckCircle2, Loader2, Send, Sparkles } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SERVICES_OPTIONS = {
  ar: [
    { value: 'تأشيرة دبي والإمارات', label: '🇦🇪 تأشيرة دبي والإمارات (شهر / شهرين / تمديد)' },
    { value: 'تأشيرة قطر', label: '🇶🇦 تأشيرة قطر (تقديم ومتابعة)' },
    { value: 'تأشيرة سلطنة عُمان', label: '🇴🇲 تأشيرة سلطنة عُمان' },
    { value: 'تأشيرة السعودية', label: '🇸🇦 تأشيرة السعودية السياحية' },
    { value: 'تأجير السيارات الفخمة', label: '🚗 تأجير السيارات الفخمة (SUV، سبورت، ليموزين)' },
    { value: 'حجز تذاكر الطيران', label: '✈️ حجز تذاكر الطيران الدولية' },
    { value: 'حجز الفنادق الفاخرة', label: '🏨 حجز الفنادق والمنتجعات الفاخرة' },
    { value: 'عقارات دبي واستثمار', label: '🏢 الاستثمار والعقارات في دبي' },
    { value: 'خدمات سياحية وباقات VIP', label: '🌴 باقات سياحية وجولات VIP' },
  ],
  fr: [
    { value: 'Visas Dubaï & EAU', label: '🇦🇪 Visas Dubaï & Émirats (1 mois / 2 mois / Extension)' },
    { value: 'Visa Qatar', label: '🇶🇦 Visa Qatar (Demande & Suivi)' },
    { value: 'Visa Oman', label: '🇴🇲 Visa Sultanat d\'Oman' },
    { value: 'Visa Arabie Saoudite', label: '🇸🇦 Visa Touristique Arabie Saoudite' },
    { value: 'Location de Voitures de Luxe', label: '🚗 Location de Voitures de Prestige (SUV, Berlines, Sport)' },
    { value: 'Billetterie & Vols', label: '✈️ Réservation Billets d\'Avion Internationaux' },
    { value: 'Hôtels & Palaces', label: '🏨 Réservation Hôtels de Luxe & Palaces' },
    { value: 'Immobilier Dubaï', label: '🏢 Investissement & Immobilier à Dubaï' },
    { value: 'Conciergerie & Tours', label: '🌴 Forfaits Touristiques & Conciergerie VIP' },
  ],
  en: [
    { value: 'Dubai & UAE Visas', label: '🇦🇪 Dubai & UAE Visas (1 month / 2 months / Extension)' },
    { value: 'Qatar Visa', label: '🇶🇦 Qatar Tourist Visa' },
    { value: 'Oman Visa', label: '🇴🇲 Oman Tourist Visa' },
    { value: 'Saudi Visa', label: '🇸🇦 Saudi Arabia Tourist Visa' },
    { value: 'Luxury Car Rental', label: '🚗 Luxury & Prestige Car Rental' },
    { value: 'Flight Tickets', label: '✈️ International Flight Bookings' },
    { value: 'Luxury Hotels', label: '🏨 Luxury Hotels & Resorts' },
    { value: 'Dubai Real Estate', label: '🏢 Dubai Real Estate & Investment' },
    { value: 'VIP Tourism Packages', label: '🌴 VIP Tourism Packages & Concierge' },
  ],
};

const RATING_LABELS = {
  ar: ['', 'مقبول', 'متوسط', 'جيد', 'جيد جداً', 'ممتاز ومثالي ⭐⭐⭐⭐⭐'],
  fr: ['', 'Passable', 'Moyen', 'Bien', 'Très bien', 'Excellent & Parfait ⭐⭐⭐⭐⭐'],
  en: ['', 'Fair', 'Average', 'Good', 'Very Good', 'Excellent & Outstanding ⭐⭐⭐⭐⭐'],
};

export default function ReviewModal({ isOpen, onClose, onSuccess }: ReviewModalProps) {
  const locale = useLocale() || 'fr';
  const isArabic = locale === 'ar';

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [service, setService] = useState(
    isArabic ? 'تأشيرة دبي والإمارات' : locale === 'en' ? 'Dubai & UAE Visas' : 'Visas Dubaï & EAU'
  );
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentServices = SERVICES_OPTIONS[locale as keyof typeof SERVICES_OPTIONS] || SERVICES_OPTIONS.fr;
  const currentLabels = RATING_LABELS[locale as keyof typeof RATING_LABELS] || RATING_LABELS.fr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (name.trim().length < 2) {
      setErrorMessage(
        isArabic
          ? 'يرجى إدخال اسمك الكامل (حرفين على الأقل).'
          : 'Veuillez renseigner votre nom complet.'
      );
      return;
    }

    if (comment.trim().length < 3) {
      setErrorMessage(
        isArabic
          ? 'يرجى كتابة تعليقك أو تفاصيل تجربتك.'
          : 'Veuillez rédiger votre commentaire.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: name.trim(),
          rating,
          service,
          comment: comment.trim(),
          country: country.trim() || (isArabic ? 'دبي' : 'Dubaï'),
          honeypot,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setIsSuccess(false);
          setName('');
          setCountry('');
          setComment('');
          setRating(5);
          onClose();
        }, 3000);
      } else {
        setErrorMessage(data.message || (isArabic ? 'حدث خطأ، يرجى المحاولة لاحقاً.' : 'Une erreur est survenue.'));
      }
    } catch {
      setErrorMessage(
        isArabic
          ? 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.'
          : 'Erreur réseau lors de l\'envoi de votre avis.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="bg-navy-950 border border-gold-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 p-6 border-b border-gold-500/20 relative">
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-5 ${isArabic ? 'left-5' : 'right-5'} p-2 rounded-full text-cream-100/60 hover:text-white hover:bg-navy-800/80 transition-colors`}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {isArabic ? 'شاركنا تجربتك وتقييمك' : 'Partagez votre Avis Client'}
              </h3>
              <p className="text-xs text-gold-400/90 mt-0.5">
                {isArabic
                  ? 'رأيك يهمنا ويساعدنا على تقديم أرقى خدمات السياحة والضيافة'
                  : 'Votre retour nous permet de vous offrir la plus haute qualité de service'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-xl font-bold text-white">
                {isArabic ? 'شكراً لك! تم إرسال تقييمك بنجاح' : 'Merci ! Votre avis a été envoyé'}
              </h4>
              <p className="text-sm text-cream-100/70 max-w-sm mx-auto leading-relaxed">
                {isArabic
                  ? 'تم استلام تقييمك وسيظهر مباشرة على الموقع بعد المراجعة السريعة من فريق الإدارة.'
                  : 'Votre avis a bien été enregistré. Il sera visible sur le site public dès sa validation par l\'administrateur.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Honeypot for bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-cream-100 uppercase tracking-wider mb-1.5">
                  {isArabic ? 'الاسم الكامل *' : 'Nom complet *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isArabic ? 'مثال: أحمد محمد' : 'Ex: Karim Benali'}
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/30"
                />
              </div>

              {/* Country / City */}
              <div>
                <label className="block text-xs font-bold text-cream-100 uppercase tracking-wider mb-1.5">
                  {isArabic ? 'بلد الإقامة أو المدينة (اختياري)' : 'Pays ou Ville (Optionnel)'}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={isArabic ? 'مثال: الجزائر 🇩🇿 أو السعودية 🇸🇦' : 'Ex: France 🇫🇷 ou Algérie 🇩🇿'}
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/30"
                />
              </div>

              {/* Service Concerned */}
              <div>
                <label className="block text-xs font-bold text-cream-100 uppercase tracking-wider mb-1.5">
                  {isArabic ? 'الخدمة التي استفدت منها *' : 'Service concerné *'}
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-gold-500 focus:outline-none cursor-pointer"
                >
                  {currentServices.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-navy-900 text-white py-1">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-cream-100 uppercase tracking-wider mb-1.5">
                  {isArabic ? 'تقييمك بالنجوم *' : 'Votre note *'}
                </label>
                <div className="flex items-center gap-2 py-1">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                          aria-label={`${star} étoiles`}
                        >
                          <Star
                            size={28}
                            className={`${
                              isActive
                                ? 'fill-gold-400 text-gold-400 drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]'
                                : 'text-navy-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-gold-400 mr-2 ml-2">
                    {currentLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Message / Comment */}
              <div>
                <label className="block text-xs font-bold text-cream-100 uppercase tracking-wider mb-1.5">
                  {isArabic ? 'تعليقك / نص التقييم *' : 'Votre avis & commentaire *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'اكتب تجربتك معنا بكل أمانة (سرعة المعاملة، الاستقبال، جودة السيارات أو الخدمات)...'
                      : 'Décrivez votre expérience avec Aymen Dubai Tourisme (qualité du service, réactivité, prise en charge)...'
                  }
                  className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl px-4 py-3 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/30 resize-none leading-relaxed"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cream-100/60 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{isSubmitting ? (isArabic ? 'جاري الإرسال...' : 'Envoi en cours...') : (isArabic ? 'إرسال التقييم الآن' : 'Envoyer mon avis')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
