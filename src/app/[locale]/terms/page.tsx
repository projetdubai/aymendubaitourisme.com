import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Terms & Conditions",
    ar: "الشروط والأحكام",
    fr: "Conditions générales",
  };
  return {
    title: titles[locale] || "Terms & Conditions",
  };
}

function TermsContent() {
  const t = useTranslations("Legal");

  return (
    <>
      <Header />
      <main className="section-padding">
        <div className="container-custom max-w-4xl">
          <h1 className="heading-2 mb-8">{t("termsConditions")}</h1>
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="heading-3 text-navy-900 mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-body">
                By accessing and using the AYMEN DUBAI TOURISME website, you
                accept and agree to be bound by these Terms and Conditions. If
                you do not agree with any part of these terms, please do not use
                our website.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">Our Services</h2>
              <p className="text-body">
                AYMEN DUBAI TOURISME provides tourism, visa assistance, hotel
                booking, flight booking, car rental, and real estate services in
                the United Arab Emirates. All services are subject to
                availability and confirmation.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">
                Quote Requests
              </h2>
              <p className="text-body">
                Submitting a quote request through our website does not
                constitute a confirmed booking or contract. Our team will review
                your request and provide a detailed quote. Services are only
                confirmed upon mutual agreement and any required payment.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">
                Pricing &amp; Payment
              </h2>
              <p className="text-body">
                All prices displayed on the website are indicative and subject
                to change. Final pricing will be communicated in your
                personalized quote. Payment terms will be agreed upon before
                service delivery.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">
                Limitation of Liability
              </h2>
              <p className="text-body">
                AYMEN DUBAI TOURISME acts as an intermediary for certain
                services. We are not liable for the actions, omissions, or
                failures of third-party service providers including hotels,
                airlines, and car rental companies.
              </p>
            </section>

            <section>
              <h2 className="heading-3 text-navy-900 mb-4">Contact</h2>
              <p className="text-body">
                For any questions regarding these terms, please contact us at{" "}
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

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TermsContent />;
}
