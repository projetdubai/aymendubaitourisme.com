import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@aymendubaitourisme.com";
  const password = process.env.ADMIN_PASSWORD || "admin123456";

  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin user
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      name: "Admin",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created/updated: ${admin.email}`);

  // Seed services
  const services = [
    {
      slug: "visa",
      titleEn: "Dubai Visa Services",
      titleAr: "خدمات تأشيرة دبي",
      titleFr: "Services de Visa Dubaï",
      descriptionEn:
        "Hassle-free tourist visas for Dubai, including 1-month, 2-month, and multiple-entry options.",
      descriptionAr:
        "تأشيرات سياحية لدبي بدون تعقيدات، تشمل تأشيرات شهر وشهرين ومتعددة الدخول.",
      descriptionFr:
        "Visas touristiques pour Dubaï sans tracas, y compris les options 1 mois, 2 mois et entrées multiples.",
      icon: "FileText",
      order: 1,
    },
    {
      slug: "visa-extension",
      titleEn: "Visa Extension",
      titleAr: "تمديد التأشيرة",
      titleFr: "Extension de Visa",
      descriptionEn:
        "Easily extend your stay in Dubai with our efficient visa extension services.",
      descriptionAr:
        "مدد إقامتك في دبي بسهولة مع خدمات تمديد التأشيرة الفعالة لدينا.",
      descriptionFr:
        "Prolongez facilement votre séjour à Dubaï avec nos services d'extension de visa efficaces.",
      icon: "FileClock",
      order: 2,
    },
    {
      slug: "hotels",
      titleEn: "Hotel Booking",
      titleAr: "حجز الفنادق",
      titleFr: "Réservation d'Hôtels",
      descriptionEn:
        "Find the perfect accommodation from budget-friendly options to luxury resorts.",
      descriptionAr:
        "اعثر على الإقامة المثالية من الخيارات الاقتصادية إلى المنتجعات الفاخرة.",
      descriptionFr:
        "Trouvez l'hébergement idéal, des options économiques aux complexes de luxe.",
      icon: "Hotel",
      order: 3,
    },
    {
      slug: "flights",
      titleEn: "Flight Booking",
      titleAr: "حجز الرحلات الجوية",
      titleFr: "Réservation de Vols",
      descriptionEn:
        "Secure the best flight deals to and from Dubai with our reliable ticketing services.",
      descriptionAr:
        "احصل على أفضل عروض الرحلات من وإلى دبي مع خدمات الحجز الموثوقة لدينا.",
      descriptionFr:
        "Obtenez les meilleures offres de vols vers et depuis Dubaï avec nos services de billetterie fiables.",
      icon: "Plane",
      order: 4,
    },
    {
      slug: "cars",
      titleEn: "Car Rental",
      titleAr: "تأجير السيارات",
      titleFr: "Location de Voitures",
      descriptionEn:
        "Explore the city at your own pace with flexible daily, weekly, and monthly car rental plans.",
      descriptionAr:
        "استكشف المدينة بحريتك مع خطط تأجير سيارات مرنة يومية وأسبوعية وشهرية.",
      descriptionFr:
        "Explorez la ville à votre rythme avec des plans de location de voiture flexibles.",
      icon: "Car",
      order: 5,
    },
    {
      slug: "tourism",
      titleEn: "UAE Tourism Services",
      titleAr: "خدمات السياحة في الإمارات",
      titleFr: "Services Touristiques aux EAU",
      descriptionEn:
        "Discover the wonders of the UAE with guided tours, desert safaris, and exclusive attraction passes.",
      descriptionAr:
        "اكتشف عجائب الإمارات مع الجولات المصحوبة بمرشدين وسفاري الصحراء وتذاكر المعالم الحصرية.",
      descriptionFr:
        "Découvrez les merveilles des EAU avec des visites guidées, des safaris dans le désert et des pass attractions exclusifs.",
      icon: "Compass",
      order: 6,
    },
    {
      slug: "real-estate",
      titleEn: "Real Estate",
      titleAr: "العقارات",
      titleFr: "Immobilier",
      descriptionEn:
        "Your trusted partner in Dubai real estate. Residential and commercial rentals, sales, and investments.",
      descriptionAr:
        "شريكك الموثوق في عقارات دبي. إيجارات ومبيعات واستثمارات سكنية وتجارية.",
      descriptionFr:
        "Votre partenaire de confiance en immobilier à Dubaï. Locations et ventes résidentielles et commerciales.",
      icon: "Building2",
      order: 7,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  console.log(`${services.length} services seeded`);

  // Seed sample properties
  const properties = [
    {
      titleEn: "Modern Apartment in Downtown Dubai",
      titleAr: "شقة حديثة في وسط دبي",
      titleFr: "Appartement Moderne à Downtown Dubaï",
      type: "APARTMENT" as const,
      category: "RENT" as const,
      furnished: true,
      readyToMove: true,
      location: "Downtown Dubai",
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      price: 120000,
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop",
      ],
      featured: true,
    },
    {
      titleEn: "Luxury Villa on Palm Jumeirah",
      titleAr: "فيلا فاخرة في نخلة جميرا",
      titleFr: "Villa de Luxe à Palm Jumeirah",
      type: "VILLA" as const,
      category: "SALE" as const,
      furnished: true,
      readyToMove: true,
      location: "Palm Jumeirah",
      bedrooms: 5,
      bathrooms: 6,
      area: 5000,
      price: 12000000,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop",
      ],
      featured: true,
    },
  ];

  for (const property of properties) {
    await prisma.property.create({ data: property });
  }

  console.log(`${properties.length} properties seeded`);

  // Seed sample approved reviews
  const reviews = [
    {
      name: "Mohammed Al-Rashid",
      country: "Saudi Arabia",
      rating: 5,
      review:
        "Exceptional visa service! The team handled my 2-month visa application seamlessly. Highly professional and responsive.",
      status: "APPROVED" as const,
    },
    {
      name: "Marie Dupont",
      country: "France",
      rating: 5,
      review:
        "Service exceptionnel pour notre séjour à Dubaï. L'hôtel était magnifique et tout était parfaitement organisé.",
      status: "APPROVED" as const,
    },
    {
      name: "Ahmed Benali",
      country: "Algeria",
      rating: 5,
      review:
        "خدمة ممتازة من أيمن دبي للسياحة. ساعدونا في كل شيء من التأشيرة إلى الفندق والجولات السياحية.",
      status: "APPROVED" as const,
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({ data: review });
  }

  console.log(`${reviews.length} reviews seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
