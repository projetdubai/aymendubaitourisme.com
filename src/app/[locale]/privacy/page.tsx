import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Privacy Policy",
    ar: "سياسة الخصوصية",
    fr: "Politique de confidentialité",
  };
  return {
    title: titles[locale] || "Privacy Policy",
  };
}

function PrivacyContent() {
  const t = useTranslations("Legal");

  return (
    <>
      <Header />
      <main className="section-padding">
        <div className="container-custom max-w-4xl">
          <h1 className="heading-2 mb-8">{t("privacyPolicy")}</h1>
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="heading-3 text-navy-900 mb-4">
                Information We Collect
              </h2>
              <p className="text-body">
                At AYMEN DUBAI TOURISME, we collect information that you
                voluntarily provide to us when you submit a quote request,
                contact form, or review. This includes your name, email address,
                phone number, country, and any additional details you choose to
                share about your travel or real estate needs.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-body">
                We use the information we collect to process your service
                requests, communicate with you about our services, provide
                customer support, and improve our website and services. We do
                not sell or share your personal information with third parties
                for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">Data Security</h2>
              <p className="text-body">
                We implement appropriate security measures to protect your
                personal information from unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">
                Cookies &amp; Analytics
              </h2>
              <p className="text-body">
                Our website may use cookies and similar technologies to enhance
                your browsing experience and analyze website traffic. You can
                control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">Contact Us</h2>
              <p className="text-body">
                If you have any questions about this Privacy Policy, please
                contact us at{" "}
                <a
                  href="mailto:Aymenboulabeiz8@gmail.com"
                  className="text-gold-500 hover:text-gold-600 underline"
                >
                  Aymenboulabeiz8@gmail.com
                </a>
                .
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-12">
              Last updated: January 2024
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}
