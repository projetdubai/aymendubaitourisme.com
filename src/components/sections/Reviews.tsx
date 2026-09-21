'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { Carousel } from '@/components/ui/Carousel';
import ReviewModal from '@/components/reviews/ReviewModal';
import { Star, MessageSquareQuote } from 'lucide-react';

interface Review {
  id: string;
  name?: string;
  author_name?: string;
  country?: string;
  rating: number;
  text?: string;
  comment?: string;
  date?: string;
  service?: string;
}

const FALLBACK_REVIEWS: Review[] = [
  {
    id: '1',
    author_name: 'Mohammed Al-Rashid',
    name: 'Mohammed Al-Rashid',
    country: 'Saudi Arabia 🇸🇦',
    rating: 5,
    comment: 'AYMEN DUBAI TOURISME provided excellent visa services. The process was smooth, fast, and highly professional. Highly recommended!',
    text: 'AYMEN DUBAI TOURISME provided excellent visa services. The process was smooth, fast, and highly professional. Highly recommended!',
    date: '2024-01-15',
    service: 'Visa Services',
  },
  {
    id: '2',
    author_name: 'Marie Dupont',
    name: 'Marie Dupont',
    country: 'France 🇫🇷',
    rating: 5,
    comment: 'Ils ont trouvé l\'hôtel de luxe parfait pour notre séjour à Dubaï. Accueil exceptionnel et service impeccable.',
    text: 'Ils ont trouvé l\'hôtel de luxe parfait pour notre séjour à Dubaï. Accueil exceptionnel et service impeccable.',
    date: '2024-02-02',
    service: 'Hôtels de Luxe',
  },
  {
    id: '3',
    author_name: 'Ahmed Benali',
    name: 'Ahmed Benali',
    country: 'Algeria 🇩🇿',
    rating: 5,
    comment: 'خدمة سريعة وموثوقة للحصول على التأشيرات وحجز الفنادق في دبي والخليج. شكراً جزيلاً للأخ أيمن وفريقه.',
    text: 'خدمة سريعة وموثوقة للحصول على التأشيرات وحجز الفنادق في دبي والخليج. شكراً جزيلاً للأخ أيمن وفريقه.',
    date: '2024-03-10',
    service: 'تأشيرة قطر وسلطنة عُمان',
  },
  {
    id: '4',
    author_name: 'Sarah Johnson',
    name: 'Sarah Johnson',
    country: 'United Kingdom 🇬🇧',
    rating: 5,
    comment: 'Very helpful in our search for a Dubai property. They showed us great options in Downtown Dubai and handled everything efficiently.',
    text: 'Very helpful in our search for a Dubai property. They showed us great options in Downtown Dubai and handled everything efficiently.',
    date: '2024-03-22',
    service: 'Real Estate Investment',
  },
  {
    id: '5',
    author_name: 'Karim Cherif',
    name: 'Karim Cherif',
    country: 'Tunisia 🇹🇳',
    rating: 5,
    comment: 'استأجرت سيارة رينج روفر سبورت، السيارة كانت في حالة وكالة جديدة تماماً والتسليم في المطار كان في الموعد.',
    text: 'استأجرت سيارة رينج روفر سبورت، السيارة كانت في حالة وكالة جديدة تماماً والتسليم في المطار كان في الموعد.',
    date: '2024-04-14',
    service: 'تأجير السيارات الفخمة',
  },
];

interface ReviewsProps {
  initialReviews?: Review[];
}

export function Reviews({ initialReviews }: ReviewsProps = {}) {
  const t = useTranslations('Reviews');
  const locale = useLocale() || 'fr';
  const isArabic = locale === 'ar';
  
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (initialReviews && initialReviews.length > 0) {
      return initialReviews;
    }
    return FALLBACK_REVIEWS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load approved reviews from API
  const loadApprovedReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews?status=approved', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      }
    } catch {
      // Keep fallback data
    }
  }, []);

  useEffect(() => {
    loadApprovedReviews();
  }, [loadApprovedReviews]);

  return (
    <section className="py-16 bg-navy-900 text-white relative overflow-hidden" id="reviews" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-gold-500 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] rounded-full bg-blue-500 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Star size={14} className="fill-gold-400" />
            <span>{isArabic ? 'تجارب العملاء الموثوقة' : 'Avis & Témoignages Clients'}</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t('title', { fallback: isArabic ? 'ماذا يقول عملاؤنا عنا' : 'Ce Que Disent Nos Clients' })}
          </h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
          <p className="text-cream-50/80 max-w-2xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            {t('subtitle', {
              fallback: isArabic
                ? 'اكتشف تجارب المسافرين ورجال الأعمال الذين وضعوا ثقتهم في خدمات أيمن دبي للسياحة.'
                : 'Découvrez les retours d\'expérience de nos voyageurs et clients VIP du monde entier.'
            })}
          </p>
        </motion.div>

        <div className="mb-12">
          <Carousel
            autoPlay
            interval={5000}
            showDots
            showArrows
            className="pb-12"
          >
            {reviews.map((review) => {
              const displayName = review.author_name || review.name || 'Client Aymen Dubai';
              const displayComment = review.comment || review.text || '';
              return (
                <div key={review.id} className="px-3 sm:px-4 py-2 h-full">
                  <Card className="bg-white/10 backdrop-blur-md border-white/15 p-6 sm:p-8 h-full flex flex-col rounded-2xl shadow-xl hover:border-gold-500/40 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-gold-400">
                        <StarRating rating={review.rating || 5} readOnly />
                      </div>
                      {review.service && (
                        <span className="text-[11px] font-medium text-gold-400/90 bg-navy-950/80 border border-gold-500/20 px-2.5 py-1 rounded-full truncate max-w-[180px]">
                          {review.service}
                        </span>
                      )}
                    </div>

                    <blockquote className="text-base sm:text-lg italic text-cream-50 flex-grow mb-6 leading-relaxed relative">
                      <MessageSquareQuote className="inline-block opacity-20 mr-1.5 -mt-1 w-5 h-5 text-gold-400" />
                      &ldquo;{displayComment}&rdquo;
                    </blockquote>

                    <div className="mt-auto border-t border-white/10 pt-4 flex justify-between items-end">
                      <div>
                        <p className="font-bold text-white text-base sm:text-lg">{displayName}</p>
                        {review.country && (
                          <p className="text-xs sm:text-sm text-gold-400">{review.country}</p>
                        )}
                      </div>
                      {review.date && (
                        <div className="text-[11px] text-cream-100/50 font-mono">
                          {review.date}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </Carousel>
        </div>

        <div className="text-center">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
            className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-gold-500/20 transition-all text-sm sm:text-base inline-flex items-center gap-2"
          >
            <Star size={17} className="fill-navy-950" />
            <span>{isArabic ? 'شاركنا تقييمك وتجربتك' : 'Laisser un avis client'}</span>
          </Button>
        </div>

        {/* Dedicated Multilingual Review Submission Modal */}
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadApprovedReviews}
        />
      </div>
    </section>
  );
}
