export const SITE_CONFIG = {
  name: "AYMEN DUBAI TOURISME",
  tagline: "Premium Travel & Hospitality",
  domain: "www.aymendubaitourisme.com",
  url: "https://www.aymendubaitourisme.com",
  phone: "+971 54 377 0253",
  whatsapp: "+971543770253",
  email: "Aymenboulabeiz8@gmail.com",
  address: "Downtown Dubai, United Arab Emirates",
  contact: {
    phone: "+971 54 377 0253",
    whatsapp: "+971543770253",
    email: "Aymenboulabeiz8@gmail.com",
  },
  social: {
    tiktok: "https://tiktok.com/@aymen_dubai_tourisme",
    instagram: "https://www.instagram.com/aymendubaitourism",
    youtube: "https://youtube.com/@aymendubaitourisme",
    facebook: "https://www.facebook.com/share/1DLTwAnENA/",
    snapchat: "https://www.snapchat.com/add/aymen.dubai",
  },
  socials: {
    tiktok: "https://tiktok.com/@aymen_dubai_tourisme",
    instagram: "https://www.instagram.com/aymendubaitourism",
    youtube: "https://youtube.com/@aymendubaitourisme",
    facebook: "https://www.facebook.com/share/1DLTwAnENA/",
    snapchat: "https://www.snapchat.com/add/aymen.dubai",
  },
} as const;

export const SERVICES = [
  "visa",
  "visa-extension",
  "hotels",
  "flights",
  "cars",
  "tourism",
  "real-estate",
] as const;

export type ServiceSlug = (typeof SERVICES)[number];

export const VISA_OPTIONS = [
  "1-month",
  "2-months",
  "multiple-entry",
  "extension",
] as const;

export const CAR_RENTAL_OPTIONS = ["daily", "weekly", "monthly"] as const;

export const TOURISM_OPTIONS = [
  "dubai-tours",
  "uae-tours",
  "desert-safari",
  "private-tours",
  "other",
] as const;

export const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "commercial",
] as const;

export const PROPERTY_CATEGORIES = ["rent", "sale"] as const;

export const REAL_ESTATE_RENTAL_OPTIONS = [
  "furnished-apartments",
  "unfurnished-apartments",
  "furnished-villas",
  "unfurnished-villas",
  "commercial",
] as const;

export const REAL_ESTATE_SALE_OPTIONS = [
  "ready-properties",
  "off-plan-properties",
  "apartments-for-sale",
  "villas-for-sale",
  "commercial-for-sale",
] as const;

export const DUBAI_AREAS = [
  "Downtown Dubai",
  "Dubai Marina",
  "Palm Jumeirah",
  "Business Bay",
  "Jumeirah Beach Residence",
  "Dubai Hills Estate",
  "Arabian Ranches",
  "DAMAC Hills",
  "Dubai Creek Harbour",
  "Jumeirah Village Circle",
  "Dubai Silicon Oasis",
  "Al Barsha",
  "Deira",
  "Bur Dubai",
  "Dubai International City",
  "Dubai Sports City",
  "Motor City",
  "Discovery Gardens",
  "Dubai Land",
  "Other",
] as const;

export const HERO_IMAGES = {
  main: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1920&auto=format&fit=crop",
  skylineSunset: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1920&auto=format&fit=crop",
} as const;

export const SERVICE_IMAGES = {
  visa: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=800&auto=format&fit=crop",
  hotels: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
  flights: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
  cars: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
  tourism: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop",
  realEstate: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
  visaExtension: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
} as const;
