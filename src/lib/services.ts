import fs from 'fs';
import path from 'path';
import os from 'os';
import { cloudDb } from './cloud-db';

export interface ServiceLocalizedText {
  fr: string;
  ar: string;
  en: string;
}

export interface TourismServiceItem {
  id: string;
  slug: string;
  title: ServiceLocalizedText;
  subtitle: ServiceLocalizedText;
  description: ServiceLocalizedText;
  iconName: string;
  image: string;
  priceStartingFrom?: string;
  badge?: ServiceLocalizedText;
  features: {
    fr: string[];
    ar: string[];
    en: string[];
  };
  ctaLink: string;
  active: boolean;
  order: number;
}

export const DEFAULT_SERVICES: TourismServiceItem[] = [
  {
    id: 'srv-visa',
    slug: 'visa',
    title: {
      fr: 'Visas Dubaï & Prolongations',
      ar: 'تأشيرات دبي وتمديد الإقامة',
      en: 'Dubai Visas & Extensions',
    },
    subtitle: {
      fr: 'Visas touristiques 30 et 60 jours, entrées multiples et prolongations sans sortie.',
      ar: 'تأشيرات سياحية 30 و 60 يوماً، دخول متعدد وتمديد داخل الدولة بدون مغادرة.',
      en: '30 & 60-day tourist visas, multiple-entry, and in-country renewals without exit.',
    },
    description: {
      fr: 'Traitement accéléré en 24h à 48h auprès des autorités de l’immigration des EAU avec un taux d’approbation exceptionnel.',
      ar: 'إنجاز رسمي سريع خلال 24 إلى 48 ساعة لدى سلطات الهجرة الإماراتية بنسبة قبول فائقة.',
      en: 'Expedited 24 to 48h government processing with exceptional approval rates.',
    },
    iconName: 'FileText',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    priceStartingFrom: '450 AED',
    badge: {
      fr: 'Populaire',
      ar: 'الأكثر طلباً',
      en: 'Popular',
    },
    features: {
      fr: ['Délivrance 24h-48h', 'Assurance santé incluse', 'Prolongation sur place', 'Support WhatsApp'],
      ar: ['إصدار خلال 24-48 ساعة', 'تأمين صحي مشمول', 'تمديد بدون مغادرة', 'دعم واتساب فوري'],
      en: ['24-48h turnaround', 'Insurance included', 'No-exit extension', 'Instant WhatsApp support'],
    },
    ctaLink: '/visa',
    active: true,
    order: 1,
  },
  {
    id: 'srv-flights',
    slug: 'flights',
    title: {
      fr: 'Billetterie & Vols Internationaux',
      ar: 'حجز تذاكر الطيران الدولية',
      en: 'Flight Booking & Airfare',
    },
    subtitle: {
      fr: 'Vols directs vers Dubaï avec Emirates et les plus grandes compagnies mondiales.',
      ar: 'رحلات مباشرة إلى دبي على متن طيران الإمارات وأكبر الخطوط العالمية.',
      en: 'Direct flights to Dubai with Emirates, flydubai, and leading international airlines.',
    },
    description: {
      fr: 'Tarifs préférentiels négociés, choix des sièges, franchises bagages généreuses et surclassements Business & First.',
      ar: 'أسعار تفضيلية حصرية، أوزان أمتعة مريحة، وترقيات لدرجتي رجال الأعمال والأولى.',
      en: 'Competitive airfares, preferred seating, generous luggage allowances, and cabin upgrades.',
    },
    iconName: 'Plane',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
    priceStartingFrom: '1,450 AED',
    badge: {
      fr: 'Meilleurs Tarifs',
      ar: 'أفضل الأسعار',
      en: 'Best Fares',
    },
    features: {
      fr: ['Vols directs quotidiens', 'Bagages 2x23kg', 'Modifications flexibles', 'Assistance voyage 24/7'],
      ar: ['رحلات يومية مباشرة', 'أمتعة 46 كجم', 'مرونة التعديل', 'متابعة طوال الرحلة'],
      en: ['Daily direct flights', '2x23kg baggage', 'Flexible date changes', '24/7 travel tracking'],
    },
    ctaLink: '/flights',
    active: true,
    order: 2,
  },
  {
    id: 'srv-hotels',
    slug: 'hotels',
    title: {
      fr: 'Hôtels 4* et 5* Luxe à Dubaï',
      ar: 'حجز فنادق 4 و 5 نجوم الفاخرة',
      en: 'Luxury 4* & 5* Hotel Booking',
    },
    subtitle: {
      fr: 'Palaces à Downtown, suites à Palm Jumeirah et resorts avec plage privée.',
      ar: 'فنادق راقية في داون تاون، أجنحة في نخلة جميرا ومنتجعات شاطئية فاخرة.',
      en: 'Downtown Dubai luxury towers, Palm Jumeirah suites, and private beachfront resorts.',
    },
    description: {
      fr: 'Accès à des tarifs de gros confidentiels, petit-déjeuner offert et surclassement de chambre selon disponibilité.',
      ar: 'أسعار جملة حصرية غير معلنة، إفطار مجاني، وترقية الغرف عند التوفر.',
      en: 'Exclusive wholesale rates, complimentary breakfast, and room upgrades upon availability.',
    },
    iconName: 'Hotel',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
    priceStartingFrom: '350 AED / nuit',
    badge: {
      fr: 'Luxe 5*',
      ar: 'فخامة 5 نجوم',
      en: '5* Luxury',
    },
    features: {
      fr: ['Downtown & Palm Jumeirah', 'Petit-déjeuner inclus', 'Annulation flexible', 'Transfert aéroport VIP'],
      ar: ['داون تاون ونخلة جميرا', 'شامل الإفطار', 'إلغاء مجاني مرن', 'توصيل من المطار'],
      en: ['Downtown & Palm locations', 'Breakfast included', 'Flexible cancellation', 'Airport VIP transfer'],
    },
    ctaLink: '/hotels',
    active: true,
    order: 3,
  },
  {
    id: 'srv-cars',
    slug: 'cars',
    title: {
      fr: 'Location de Voitures de Luxe & Flotte',
      ar: 'تأجير سيارات فارهة ورياضية',
      en: 'Luxury & Sports Car Rental',
    },
    subtitle: {
      fr: 'Lamborghini, Ferrari, Rolls-Royce, Porsche, Mercedes Classe G et SUV familiaux.',
      ar: 'لامبورغيني، فيراري، رولز رويس، بورش، مرسيدس جي كلاس وسيارات دفع رباعي.',
      en: 'Lamborghini, Ferrari, Rolls-Royce, Porsche, Mercedes G-Wagon, and luxury SUVs.',
    },
    description: {
      fr: 'Livraison gratuite à l’aéroport ou à votre hôtel à Dubaï avec assurance tous risques incluse.',
      ar: 'توصيل مجاني فوري إلى المطار أو مقر إقامتك مع تأمين شامل.',
      en: 'Complimentary delivery to Dubai Airport or your hotel with comprehensive insurance.',
    },
    iconName: 'Car',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    priceStartingFrom: '350 AED / jour',
    badge: {
      fr: 'Supercars',
      ar: 'سيارات خارقة',
      en: 'Supercars',
    },
    features: {
      fr: ['Livraison aéroport VIP', 'Assurance tous risques', '250 km / jour inclus', 'Sans frais cachés'],
      ar: ['توصيل للمطار مجاناً', 'تأمين شامل', '250 كم يومياً', 'بدون أي رسوم خفية'],
      en: ['VIP airport delivery', 'Full insurance included', '250 km/day allowance', 'Zero hidden fees'],
    },
    ctaLink: '/cars',
    active: true,
    order: 4,
  },
  {
    id: 'srv-realestate',
    slug: 'real-estate',
    title: {
      fr: 'Immobilier & Investissement Dubaï',
      ar: 'العقارات والاستثمار في دبي',
      en: 'Dubai Real Estate & Investment',
    },
    subtitle: {
      fr: 'Appartements haut de gamme, villas de prestige, programmes neufs (Off-Plan) et Golden Visa.',
      ar: 'شقق فاخرة، فلل راقية، مشاريع على الخارطة (Off-Plan) والإقامة الذهبية.',
      en: 'Premium apartments, luxury villas, off-plan developer projects, and Golden Visa advisory.',
    },
    description: {
      fr: 'Rendements locatifs élevés jusqu’à 9% nets, exonération totale d’impôts et accompagnement juridique complet.',
      ar: 'عوائد إيجارية استثنائية تصل إلى 9% صافي، إعفاء ضريبي كامل، واستشارات قانونية متكاملة.',
      en: 'High net rental yields up to 9%, zero income tax, and full end-to-end legal support.',
    },
    iconName: 'Building2',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    badge: {
      fr: 'Investissement Rentable',
      ar: 'استثمار مضمون',
      en: 'High ROI',
    },
    features: {
      fr: ['Éligibilité Golden Visa 10 ans', '0% d’impôt sur les revenus', 'Programmes Emaar, Nakheel, Sobha', 'Gestion locative clé en main'],
      ar: ['مؤهل للإقامة الذهبية 10 سنوات', '0% ضرائب على الدخل', 'مشاريع إعمار ونخيل وشوبا', 'إدارة وتأجير العقار بالكامل'],
      en: ['10-Year Golden Visa eligible', '0% personal income tax', 'Emaar, Nakheel & Sobha projects', 'Turnkey property management'],
    },
    ctaLink: '/real-estate',
    active: true,
    order: 5,
  },
  {
    id: 'srv-tourism',
    slug: 'tourism',
    title: {
      fr: 'Safari Désert & Activités Touristiques',
      ar: 'رحلات سفاري الصحراء والأنشطة السياحية',
      en: 'Desert Safari & Dubai Tourism',
    },
    subtitle: {
      fr: 'Safari en 4x4 dans les dunes, dîner bédouin sous les étoiles, quads, buggies et balade en dromadaire.',
      ar: 'سفاري بسيارات الدفع الرباعي، عشاء بدوي فاخر تحت النجوم، دراجات وسيارات باجي.',
      en: 'Dune bashing 4x4 safaris, VIP Bedouin camp dinners, quad biking, and camel trekking.',
    },
    description: {
      fr: 'Vivez l’expérience magique du désert de Dubaï avec nos guides professionnels certifiés.',
      ar: 'عش سحر الصحراء وتجربة المغامرة مع مرشدينا المحترفين والمعتمدين.',
      en: 'Experience the magic of the Arabian desert with certified VIP guides.',
    },
    iconName: 'Compass',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
    priceStartingFrom: '250 AED',
    badge: {
      fr: 'Incontournable',
      ar: 'تجربة لا تفوت',
      en: 'Must Experience',
    },
    features: {
      fr: ['Transfert aller-retour hôtel', 'Dune Bashing & Sandboard', 'Spectacle oriental & Barbecue VIP', 'Quad & Buggy sur option'],
      ar: ['توصيل من وإلى الفندق', 'مغامرة الكثبان الرملية', 'بوفيه شواء وعروض فلكلورية', 'دراجات باجي اختيارية'],
      en: ['Hotel round-trip transfers', 'Dune bashing & sandboarding', 'VIP BBQ dinner & live shows', 'Optional quad & buggy'],
    },
    ctaLink: '/quote?service=tourism',
    active: true,
    order: 6,
  },
  {
    id: 'srv-yachts',
    slug: 'yachts',
    title: {
      fr: 'Location de Yachts & Croisières Marina',
      ar: 'تأجير اليخوت الفاخرة وجولات المارينا',
      en: 'Luxury Yacht Charter & Marina Cruises',
    },
    subtitle: {
      fr: 'Yachts privés de 40 à 100 pieds avec équipage, chef à bord, Jet Ski et son immersif.',
      ar: 'يخوت خاصة فاخرة من 40 إلى 100 قدم مع طاقم محترف، شيف خاص، وجت سكي.',
      en: 'Private yachts from 40 to 100ft with captain, crew, onboard chef, and Jet Ski.',
    },
    description: {
      fr: 'Naviguez le long de Dubai Marina, Burj Al Arab, Atlantis The Palm et Ain Dubai dans un confort d’exception.',
      ar: 'أبحر أمام دبي مارينا وبرج العرب وأتلانتس النخلة وعين دبي بأعلى مستويات الرفاهية.',
      en: 'Sail past Dubai Marina, Burj Al Arab, and Atlantis The Palm in total luxury.',
    },
    iconName: 'Anchor',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?q=80&w=800&auto=format&fit=crop',
    priceStartingFrom: '600 AED / heure',
    badge: {
      fr: 'Prestige Marin',
      ar: 'فخامة بحرية',
      en: 'Prestige',
    },
    features: {
      fr: ['Équipage et carburant inclus', 'Vue Burj Al Arab & Atlantis', 'Musique Bluetooth & Barbecue', 'Jet Ski & Seabob disponibles'],
      ar: ['طاقم عمل ووقود مشمول', 'إطلالة برج العرب وأتلانتس', 'نظام صوتي وشواء على متن اليخت', 'جت سكي وألعاب مائية'],
      en: ['Captain, crew & fuel included', 'Burj Al Arab & Palm views', 'Sound system & BBQ facilities', 'Jet Ski & watersports available'],
    },
    ctaLink: '/quote?service=tourism',
    active: true,
    order: 7,
  },
  {
    id: 'srv-vip',
    slug: 'vip-concierge',
    title: {
      fr: 'Accueil VIP Aéroport & Chauffeur Privé',
      ar: 'استقبال VIP في المطار وسائق خاص',
      en: 'VIP Airport Meet & Assist / Chauffeur',
    },
    subtitle: {
      fr: 'Service Marhaba rapide coupe-file aux douanes, port des bagages et transfert en Mercedes Classe S.',
      ar: 'خدمة مرحبا السريعة لتجاوز الطوابير، استلام الحقائب وتوصيل بسيارات مرسيدس إس كلاس الفارهة.',
      en: 'Fast-track airport clearance, luggage escort, and transfer in executive Mercedes S-Class or Maybach.',
    },
    description: {
      fr: 'Arrivez à Dubaï comme un dignitaire. Accueil dès la sortie de l’avion et transport serein vers votre palace.',
      ar: 'استقبال ملكي فور الخروج من بوابة الطائرة وتوصيل فاخر ومريح إلى مقر إقامتك.',
      en: 'Touch down in Dubai with royal treatment. Escort from airbridge to your destination in ultra-comfort.',
    },
    iconName: 'ShieldCheck',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop',
    priceStartingFrom: '400 AED',
    badge: {
      fr: 'Service VIP',
      ar: 'خدمة كبار الشخصيات',
      en: 'VIP Concierge',
    },
    features: {
      fr: ['Passage douanes coupe-file', 'Salons VIP aéroport', 'Chauffeur en costume professionnel', 'Véhicules de prestige ultra-propres'],
      ar: ['مسار سريع عند الجوازات', 'دخول صالات كبار الشخصيات', 'سائق محترف ولبق', 'سيارات فاخرة ونظيفة جداً'],
      en: ['Fast-track immigration', 'Airport executive lounge', 'Chauffeured luxury cars', 'Punctual & bilingual drivers'],
    },
    ctaLink: '/quote?service=tourism',
    active: true,
    order: 8,
  },
];

declare global {
  var __services_cache: TourismServiceItem[] | undefined;
}

const PRIMARY_FILE = path.join(process.cwd(), 'src', 'data', 'services.json');
const TMP_FILE = path.join(os.tmpdir(), 'aymen_services.json');

export function readServices(): TourismServiceItem[] {
  if (globalThis.__services_cache && Array.isArray(globalThis.__services_cache) && globalThis.__services_cache.length > 0) {
    return globalThis.__services_cache;
  }

  // 1. Primary file
  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__services_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read primary services file:', err);
  }

  // 2. Tmp file
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__services_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read tmp services file:', err);
  }

  globalThis.__services_cache = [...DEFAULT_SERVICES];
  return globalThis.__services_cache;
}

export async function readServicesAsync(): Promise<TourismServiceItem[]> {
  try {
    const cloudServices = await cloudDb.get<TourismServiceItem[]>('services');
    if (Array.isArray(cloudServices) && cloudServices.length > 0) {
      globalThis.__services_cache = cloudServices;
      return cloudServices;
    }
  } catch (err) {
    console.warn('Could not read services from cloudDb:', err);
  }
  return readServices();
}

export function writeServices(services: TourismServiceItem[]): boolean {
  globalThis.__services_cache = [...services];

  // Primary file
  try {
    const dir = path.dirname(PRIMARY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, JSON.stringify(services, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to primary services file:', err);
  }

  // Tmp file
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(services, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to tmp services file:', err);
  }

  // Async save to Cloud DB
  cloudDb.set('services', services).catch((err) => {
    console.warn('Error saving services to cloudDb:', err);
  });
  cloudDb.invalidate('services');

  return true;
}
