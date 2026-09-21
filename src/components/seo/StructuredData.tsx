import { SITE_CONFIG } from "@/lib/constants";

interface StructuredDataProps {
  locale: string;
}

export default function StructuredData({ locale }: StructuredDataProps) {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    name: "AYMEN DUBAI TOURISME",
    description:
      locale === "ar"
        ? "أيمن دبي للسياحة - خدمات التأشيرات، حجز الفنادق، تأجير السيارات، السياحة والعقارات في دبي والإمارات"
        : locale === "fr"
          ? "AYMEN DUBAI TOURISME - Services de visa, réservation d'hôtels, location de voitures, tourisme et immobilier à Dubaï"
          : "AYMEN DUBAI TOURISME - Visa services, hotel booking, car rental, tourism and real estate in Dubai, UAE",
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "25.2048",
      longitude: "55.2708",
    },
    areaServed: {
      "@type": "Country",
      name: "United Arab Emirates",
    },
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.youtube,
      SITE_CONFIG.social.tiktok,
      SITE_CONFIG.social.snapchat,
    ],
    image: `${SITE_CONFIG.url}/logo.jpeg`,
    logo: `${SITE_CONFIG.url}/logo.jpeg`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.phone,
      contactType: "customer service",
      availableLanguage: ["English", "Arabic", "French"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dubai Travel Services",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Visa Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Dubai Tourist Visa",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Hotel Booking",
        },
        {
          "@type": "OfferCatalog",
          name: "Flight Booking",
        },
        {
          "@type": "OfferCatalog",
          name: "Car Rental",
        },
        {
          "@type": "OfferCatalog",
          name: "Real Estate Services",
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
    />
  );
}
