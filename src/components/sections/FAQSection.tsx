"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqData = {
  fr: {
    title: "Questions Fréquentes",
    subtitle: "Tout ce que vous devez savoir pour votre séjour à Dubaï",
    questions: [
      {
        q: "Comment obtenir un visa pour Dubaï rapidement ?",
        a: "Nous nous occupons de toutes les démarches pour vous. Il vous suffit de nous fournir une copie de votre passeport et une photo d'identité. Le visa est généralement délivré sous 24 à 48 heures."
      },
      {
        q: "Quels sont les documents requis pour louer une voiture de luxe ?",
        a: "Vous aurez besoin d'un permis de conduire valide (international si hors GCC/Europe), de votre passeport avec visa, et d'une carte de crédit pour la caution."
      },
      {
        q: "Proposez-vous un service de prise en charge VIP dès l'aéroport ?",
        a: "Oui, nous offrons un service complet de conciergerie incluant l'accueil VIP à l'aéroport avec transfert en véhicule de luxe jusqu'à votre hôtel."
      },
      {
        q: "Puis-je réserver des vols et hôtels avec modification flexible ?",
        a: "Absolument. Nos partenariats exclusifs nous permettent de vous proposer des tarifs avantageux avec des conditions d'annulation et de modification flexibles selon vos besoins."
      },
      {
        q: "Comment contacter directement l'équipe Aymen Dubai Tourisme ?",
        a: "Vous pouvez nous joindre 24/7 via WhatsApp en utilisant le bouton ci-dessous, par email, ou par téléphone. Notre équipe multilingue est toujours à votre disposition."
      }
    ],
    cta: "Contactez-nous sur WhatsApp"
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know for your Dubai trip",
    questions: [
      {
        q: "How can I get a Dubai visa quickly?",
        a: "We handle the entire process for you. Just provide a copy of your passport and a passport-sized photo. Visas are typically issued within 24 to 48 hours."
      },
      {
        q: "What documents are required to rent a luxury car?",
        a: "You will need a valid driver's license (international if outside GCC/Europe), your passport with visa, and a credit card for the security deposit."
      },
      {
        q: "Do you offer VIP airport pickup services?",
        a: "Yes, we offer a comprehensive concierge service that includes VIP airport meet & greet along with a luxury vehicle transfer to your hotel."
      },
      {
        q: "Can I book flights and hotels with flexible modifications?",
        a: "Absolutely. Our exclusive partnerships allow us to offer you great rates with flexible cancellation and modification terms according to your needs."
      },
      {
        q: "How can I directly contact the Aymen Dubai Tourisme team?",
        a: "You can reach us 24/7 via WhatsApp using the button below, by email, or by phone. Our multilingual team is always at your disposal."
      }
    ],
    cta: "Contact us on WhatsApp"
  },
  ar: {
    title: "الأسئلة الشائعة",
    subtitle: "كل ما تحتاج معرفته لإقامتك في دبي",
    questions: [
      {
        q: "كيف يمكنني الحصول على تأشيرة دبي بسرعة؟",
        a: "نحن نتكفل بجميع الإجراءات نيابة عنك. كل ما عليك فعله هو تزويدنا بنسخة من جواز سفرك وصورة شخصية. عادة ما يتم إصدار التأشيرة خلال 24 إلى 48 ساعة."
      },
      {
        q: "ما هي الوثائق المطلوبة لاستئجار سيارة في دبي؟",
        a: "ستحتاج إلى رخصة قيادة سارية (دولية إذا كانت من خارج دول مجلس التعاون الخليجي/أوروبا)، وجواز سفرك مع التأشيرة، وبطاقة ائتمان لتأمين الحجز."
      },
      {
        q: "هل توفرون خدمة استقبال VIP في المطار؟",
        a: "نعم، نقدم خدمة كونسيرج متكاملة تشمل الاستقبال لكبار الشخصيات في المطار مع النقل بسيارة فاخرة إلى فندقك."
      },
      {
        q: "هل يمكنني حجز الطيران والفنادق بمرونة كاملة؟",
        a: "بالتأكيد. شراكاتنا الحصرية تتيح لنا أن نقدم لك أسعاراً مميزة مع شروط إلغاء وتعديل مرنة تتناسب مع احتياجاتك."
      },
      {
        q: "كيف يمكنني التواصل مباشرة مع وكالة أيمن دبي؟",
        a: "يمكنك التواصل معنا على مدار الساعة طوال أيام الأسبوع عبر واتساب باستخدام الزر أدناه، أو عبر البريد الإلكتروني، أو عبر الهاتف. فريقنا متعدد اللغات دائماً في خدمتك."
      }
    ],
    cta: "تواصل معنا عبر واتساب"
  }
};

export function FAQSection() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const content = faqData[locale as keyof typeof faqData] || faqData.en;
  
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-gray-600">
            {content.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {content.questions.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
                >
                  <span className="font-semibold text-navy-900 text-lg pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 text-gold-600 transition-transform duration-300 flex-shrink-0",
                      isOpen && "transform rotate-180"
                    )} 
                  />
                </button>
                
                <div 
                  className={cn(
                    "px-6 overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="text-gray-600">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://wa.me/971543770253?text=Hello, I have a question regarding your services."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
          >
            {content.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
