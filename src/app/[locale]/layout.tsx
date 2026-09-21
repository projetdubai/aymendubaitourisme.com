import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Inter, Cairo } from "next/font/google";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import VisitorTracker from "@/components/analytics/VisitorTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages: any = await getMessages();


  return {
    title: {
      default: messages.Metadata?.title || "AYMEN DUBAI TOURISME",
      template: `%s | AYMEN DUBAI TOURISME`,
    },
    description: messages.Metadata?.description || "",
    metadataBase: new URL("https://www.aymendubaitourisme.com"),
    alternates: {
      canonical: `https://www.aymendubaitourisme.com/${locale}`,
      languages: {
        en: "https://www.aymendubaitourisme.com/en",
        ar: "https://www.aymendubaitourisme.com/ar",
        fr: "https://www.aymendubaitourisme.com/fr",
      },
    },
    openGraph: {
      title: messages.Metadata?.title || "AYMEN DUBAI TOURISME",
      description: messages.Metadata?.description || "",
      url: `https://www.aymendubaitourisme.com/${locale}`,
      siteName: "AYMEN DUBAI TOURISME",
      locale: locale === "ar" ? "ar_AE" : locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: messages.Metadata?.title || "AYMEN DUBAI TOURISME",
      description: messages.Metadata?.description || "",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const isRtl = locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${isRtl ? "font-cairo" : "font-inter"} antialiased bg-cream-50 text-navy-900 selection:bg-gold-500/20 selection:text-navy-900`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <VisitorTracker />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
