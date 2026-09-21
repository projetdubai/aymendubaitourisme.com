import fs from 'fs';
import path from 'path';
import os from 'os';
import { cloudDb } from './cloud-db';

export interface VisaLocalizedText {
  fr: string;
  ar: string;
  en: string;
}

export interface VisaItem {
  id: string;
  slug: string;
  title: VisaLocalizedText;
  subtitle: VisaLocalizedText;
  category: 'dubai' | 'extension' | 'express' | 'gcc';
  duration: string;
  price: string;
  processingTime: string;
  badge: VisaLocalizedText;
  features: {
    fr: string[];
    ar: string[];
    en: string[];
  };
  requirements: {
    fr: string[];
    ar: string[];
    en: string[];
  };
  image?: string;
  active: boolean;
  order: number;
}

export const DEFAULT_VISAS: VisaItem[] = [
  {
    id: 'visa-30d',
    slug: '1-month',
    title: {
      fr: 'Visa Tourisme 1 Mois (30 Jours)',
      ar: 'تأشيرة سياحية شهر (30 يوماً)',
      en: '30-Day Tourist Visa (1 Month)',
    },
    subtitle: {
      fr: 'Idéal pour les vacances et les séjours courts à Dubaï.',
      ar: 'مثالية للإجازات القصيرة وزيارات العمل السريعة.',
      en: 'Ideal for short vacations, family visits, or business trips.',
    },
    category: 'dubai',
    duration: '30 Jours',
    price: '450 AED',
    processingTime: '24h - 48h',
    badge: {
      fr: 'Le Plus Demandé',
      ar: 'الأكثر طلباً',
      en: 'Most Popular',
    },
    features: {
      fr: [
        "Validité d'entrée de 60 jours dès délivrance",
        'Durée de séjour de 30 jours consécutifs aux EAU',
        'Délivrance rapide en 24h à 48h par email et WhatsApp',
        'Assurance santé voyage obligatoire incluse',
      ],
      ar: [
        'صلاحية الدخول 60 يوماً من تاريخ الإصدار',
        'مدة الإقامة 30 يوماً متواصلة داخل الدولة',
        'إصدار سريع خلال 24-48 ساعة عبر الواتساب والإيميل',
        'شامل التأمين الصحي الإماراتي المعتمد',
      ],
      en: [
        '60-day entry validity from date of issuance',
        '30 consecutive days stay in the UAE',
        'Quick electronic delivery within 24-48h',
        'Mandatory UAE travel & health insurance included',
      ],
    },
    requirements: {
      fr: [
        'Copie claire du passeport (valide 6 mois minimum)',
        'Photo d’identité sur fond blanc',
      ],
      ar: [
        'صورة واضحة لجواز السفر (ساري المفعول لمدة 6 أشهر على الأقل)',
        'صورة شخصية حديثة بخلفية بيضاء',
      ],
      en: [
        'Clear passport copy (valid at least 6 months)',
        'Recent passport-size photo with white background',
      ],
    },
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    active: true,
    order: 1,
  },
  {
    id: 'visa-60d',
    slug: '2-months',
    title: {
      fr: 'Visa Tourisme 2 Mois (60 Jours)',
      ar: 'تأشيرة سياحية شهرين (60 يوماً)',
      en: '60-Day Tourist Visa (2 Months)',
    },
    subtitle: {
      fr: 'Parfait pour les longs séjours, prospection professionnelle et famille.',
      ar: 'للإقامات الطويلة واستكشاف فرص العمل والاستثمار وزيارة الأهل.',
      en: 'Perfect for extended holidays, job search, or business exploration.',
    },
    category: 'dubai',
    duration: '60 Jours',
    price: '850 AED',
    processingTime: '24h - 48h',
    badge: {
      fr: 'Meilleure Valeur',
      ar: 'قيمة ممتازة',
      en: 'Best Value',
    },
    features: {
      fr: [
        "Validité d'entrée de 60 jours dès délivrance",
        'Durée de séjour de 60 jours consécutifs aux EAU',
        'Possibilité de prolongation officielle sur place',
        'Délivrance certifiée rapide avec assurance incluse',
      ],
      ar: [
        'صلاحية الدخول 60 يوماً من تاريخ الإصدار',
        'مدة الإقامة 60 يوماً كاملة ومتواصلة',
        'إمكانية التمديد الرسمي دون مغادرة الدولة',
        'إصدار موثق وسريع مع التأمين المعتمد',
      ],
      en: [
        '60-day entry validity from issuance',
        '60 full days continuous stay in the UAE',
        'Extendable in-country without leaving',
        'Official government approved processing with insurance',
      ],
    },
    requirements: {
      fr: [
        'Copie claire du passeport (valide 6 mois minimum)',
        'Photo d’identité sur fond blanc',
      ],
      ar: [
        'صورة واضحة لجواز السفر (ساري 6 أشهر على الأقل)',
        'صورة شخصية حديثة بخلفية بيضاء',
      ],
      en: [
        'Clear passport copy (valid 6 months)',
        'Recent photo with white background',
      ],
    },
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop',
    active: true,
    order: 2,
  },
  {
    id: 'visa-multi',
    slug: 'multiple-entry',
    title: {
      fr: 'Visa Entrées Multiples',
      ar: 'تأشيرة متعددة الدخول',
      en: 'Multiple-Entry Tourist Visa',
    },
    subtitle: {
      fr: 'Pour les voyageurs fréquents, entrepreneurs et déplacements régionaux.',
      ar: 'للمسافرين الدائمين ورجال الأعمال وزوار المعارض والمؤتمرات.',
      en: 'Tailored for frequent flyers, business executives, and regional visitors.',
    },
    category: 'dubai',
    duration: '30 ou 60 Jours',
    price: '1,200 AED',
    processingTime: '24h - 48h',
    badge: {
      fr: 'Flexibilité Totale',
      ar: 'مرونة كاملة',
      en: 'Maximum Flexibility',
    },
    features: {
      fr: [
        'Entrées et sorties illimitées pendant la validité',
        'Idéal pour combiner Dubaï, Qatar, Oman et l’Arabie Saoudite',
        'Options 30 jours ou 60 jours disponibles',
        'Assistance et suivi prioritaire 24h/7j',
      ],
      ar: [
        'دخول وخروج متعدد غير محدود طوال فترة الصلاحية',
        'مثالية للسفر بين دبي وقطر وعُمان والسعودية',
        'خيارات 30 يوماً أو 60 يوماً متوفرة',
        'متابعة ودعم مستمر على مدار 24/7',
      ],
      en: [
        'Unlimited entries and exits during visa validity',
        'Perfect for regional trips between UAE, Qatar, Oman and Saudi',
        '30-day and 60-day options available',
        'Priority 24/7 dedicated travel concierge',
      ],
    },
    requirements: {
      fr: [
        'Copie claire du passeport (valide 6 mois minimum)',
        'Photo d’identité sur fond blanc',
      ],
      ar: [
        'صورة واضحة لجواز السفر',
        'صورة شخصية حديثة بخلفية بيضاء',
      ],
      en: [
        'Passport copy (valid 6+ months)',
        'Recent photo with white background',
      ],
    },
    image: 'https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=800&auto=format&fit=crop',
    active: true,
    order: 3,
  },
  {
    id: 'visa-extension',
    slug: 'extension',
    title: {
      fr: 'Prolongation de Visa sur Place',
      ar: 'تمديد التأشيرة داخل الدولة (بدون مغادرة)',
      en: 'In-Country Visa Extension (No Exit)',
    },
    subtitle: {
      fr: 'Prolongez votre séjour légal à Dubaï sans quitter le pays ni aller à l’aéroport.',
      ar: 'مدد إقامتك القانونية في دبي دون الحاجة لمغادرة المطار أو السفر.',
      en: 'Extend your legal stay without border runs or leaving the country.',
    },
    category: 'extension',
    duration: '30 ou 60 Jours',
    price: '1,450 AED',
    processingTime: 'Express 12h - 24h',
    badge: {
      fr: 'Sans Sortie de Territoire',
      ar: 'بدون مغادرة',
      en: 'No Exit Required',
    },
    features: {
      fr: [
        'Procédure 100% officielle sans passer par l’aéroport',
        'Évitez toutes les pénalités et amendes de dépassement (Overstay)',
        'Traitement urgent sous 12h à 24h',
        'Suivi rigoureux jusqu’à réception du visa renouvelé',
      ],
      ar: [
        'إجراء رسمي 100% داخل الدولة بدون السفر للمطار',
        'تجنب الغرامات المالية ومخالفات الإقامة (Overstay)',
        'معالجة عاجلة خلال 12 إلى 24 ساعة فقط',
        'متابعة فورية حتى صدور التأشيرة الجديدة',
      ],
      en: [
        '100% official renewal inside the UAE without leaving',
        'Avoid overstay fines and penalties completely',
        'Express processing within 12 to 24 hours',
        'End-to-end government tracking until delivery',
      ],
    },
    requirements: {
      fr: [
        'Copie du passeport',
        'Copie du visa touristique actuel',
        'Tampon d’entrée aux EAU',
      ],
      ar: [
        'صورة جواز السفر',
        'صورة التأشيرة الحالية',
        'ختم الدخول لدولة الإمارات',
      ],
      en: [
        'Passport copy',
        'Current UAE tourist visa copy',
        'UAE entry stamp copy',
      ],
    },
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=800&auto=format&fit=crop',
    active: true,
    order: 4,
  },
  {
    id: 'visa-express',
    slug: 'express',
    title: {
      fr: 'Visa Express VIP (Urgence 12h)',
      ar: 'تأشيرة إكسبريس عاجلة (خلال 12 ساعة)',
      en: 'VIP Express Visa (12-Hour Urgent)',
    },
    subtitle: {
      fr: 'Traitement gouvernemental prioritaire pour les départs imprévus ou imminents.',
      ar: 'معالجة حكومية عاجلة وفورية للمغادرات الطارئة والرحلات السريعة.',
      en: 'Top-priority government processing for urgent and last-minute travel.',
    },
    category: 'express',
    duration: '30 ou 60 Jours',
    price: '750 AED',
    processingTime: '6h - 12h Express',
    badge: {
      fr: 'Urgence VIP',
      ar: 'عاجل وفوري',
      en: 'VIP Express',
    },
    features: {
      fr: [
        'Canal de soumission gouvernemental express',
        'Délivrance en moins de 12 heures garanties',
        'Assistance VIP dédiée en direct sur WhatsApp',
        'Garantie d’audit et de conformité préalable',
      ],
      ar: [
        'مسار حكومي فائق السرعة والأولوية',
        'إصدار مضمون في أقل من 12 ساعة',
        'دعم ومتابعة شخصية عبر الواتساب',
        'تدقيق فوري للوثائق لضمان القبول',
      ],
      en: [
        'Fast-track VIP government submission',
        'Guaranteed delivery in under 12 hours',
        'Dedicated VIP WhatsApp manager',
        'Pre-application document compliance audit',
      ],
    },
    requirements: {
      fr: [
        'Copie claire du passeport (valide 6 mois minimum)',
        'Photo d’identité sur fond blanc',
      ],
      ar: [
        'صورة واضحة لجواز السفر',
        'صورة شخصية بخلفية بيضاء',
      ],
      en: [
        'Clear passport copy',
        'Recent photo with white background',
      ],
    },
    image: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=80&w=800&auto=format&fit=crop',
    active: true,
    order: 5,
  },
  {
    id: 'visa-gcc',
    slug: 'gcc-visas',
    title: {
      fr: 'Visas Pays du Golfe (Qatar & Oman)',
      ar: 'تأشيرات دول الخليج (قطر وسلطنة عُمان)',
      en: 'GCC Tourist Visas (Qatar & Oman)',
    },
    subtitle: {
      fr: 'Délivrance rapide de visas touristiques pour vos séjours à Doha ou Mascate.',
      ar: 'إصدار سريع لتأشيرات الدخول السياحية لدولة قطر وسلطنة عُمان.',
      en: 'Rapid tourist visa processing for visits to Doha (Qatar) or Muscat (Oman).',
    },
    category: 'gcc',
    duration: '30 Jours',
    price: '350 AED',
    processingTime: '24h - 48h',
    badge: {
      fr: 'Région GCC',
      ar: 'دول الخليج',
      en: 'GCC Region',
    },
    features: {
      fr: [
        'Visa officiel Qatar (Hayya / Tourisme)',
        'Visa officiel Sultanat d’Oman e-Visa',
        'Assistance complète pour formalités frontalières',
        'Support multilingue en Français, Arabe et Anglais',
      ],
      ar: [
        'تأشيرة قطر الرسمية (منصة هيا / سياحة)',
        'تأشيرة سلطنة عُمان الإلكترونية',
        'تسهيل كامل لكافة إجراءات الدخول والحدود',
        'دعم متواصل باللغات العربية والفرنسية والإنجليزية',
      ],
      en: [
        'Official Qatar tourist visa (Hayya platform)',
        'Official Sultanate of Oman e-Visa',
        'Full guidance on border regulations & flights',
        'Multilingual assistance in French, Arabic & English',
      ],
    },
    requirements: {
      fr: [
        'Copie du passeport (valide 6 mois minimum)',
        'Photo d’identité',
      ],
      ar: [
        'صورة جواز السفر',
        'صورة شخصية',
      ],
      en: [
        'Passport copy (valid 6 months)',
        'Passport photo',
      ],
    },
    image: 'https://images.unsplash.com/photo-1579606032834-deffd309722b?q=80&w=800&auto=format&fit=crop',
    active: true,
    order: 6,
  },
];

declare global {
  var __visas_cache: VisaItem[] | undefined;
}

const PRIMARY_FILE = path.join(process.cwd(), 'src', 'data', 'visas.json');
const TMP_FILE = path.join(os.tmpdir(), 'aymen_visas.json');

export function readVisas(): VisaItem[] {
  if (globalThis.__visas_cache && Array.isArray(globalThis.__visas_cache) && globalThis.__visas_cache.length > 0) {
    return globalThis.__visas_cache;
  }

  // 1. Primary file
  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__visas_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read primary visas file:', err);
  }

  // 2. Tmp file
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__visas_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read tmp visas file:', err);
  }

  globalThis.__visas_cache = [...DEFAULT_VISAS];
  return globalThis.__visas_cache;
}

export async function readVisasAsync(): Promise<VisaItem[]> {
  try {
    const cloudVisas = await cloudDb.get<VisaItem[]>('visas');
    if (Array.isArray(cloudVisas) && cloudVisas.length > 0) {
      globalThis.__visas_cache = cloudVisas;
      return cloudVisas;
    }
  } catch (err) {
    console.warn('Could not read visas from cloudDb:', err);
  }
  return readVisas();
}

export function writeVisas(visas: VisaItem[]): boolean {
  globalThis.__visas_cache = [...visas];

  // Try writing to primary file
  try {
    const dir = path.dirname(PRIMARY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, JSON.stringify(visas, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to primary visas file (read-only filesystem):', err);
  }

  // Always back up to tmp
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(visas, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to tmp visas file:', err);
  }

  // Async save to Cloud DB
  cloudDb.set('visas', visas).catch((err) => {
    console.warn('Error saving visas to cloudDb:', err);
  });
  cloudDb.invalidate('visas');

  return true;
}
