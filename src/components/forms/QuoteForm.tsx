"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  Plane,
  Building,
  Car,
  Compass,
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  MessageCircle,
  Loader2,
  Calendar,
  Users,
  MapPin,
  Coins,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { quoteFormSchema, QuoteFormValues } from "@/lib/validations";
import { formatQuoteForWhatsApp } from "@/lib/whatsapp";
import { cn, getWhatsAppUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";

const SERVICES = [
  { id: "visa", icon: FileText, key: "visa" },
  { id: "hotels", icon: Building, key: "hotels" },
  { id: "flights", icon: Plane, key: "flights" },
  { id: "cars", icon: Car, key: "cars" },
  { id: "tourism", icon: Compass, key: "tourism" },
  { id: "realEstate", icon: Home, key: "realEstate" },
];

const SUB_SERVICES: Record<string, { key: string; options: string[] }> = {
  visa: {
    key: "visaOptions",
    options: ["1month", "2months", "multi", "extend"],
  },
  hotels: {
    key: "hotelOptions",
    options: ["luxury", "business", "suite", "resort"],
  },
  flights: {
    key: "flightOptions",
    options: ["business", "economy", "charter"],
  },
  cars: {
    key: "carOptions",
    options: ["daily", "weekly", "monthly", "chauffeur"],
  },
  tourism: {
    key: "tourismOptions",
    options: ["safari", "cityTour", "yacht", "helicopter", "tickets"],
  },
  realEstate: {
    key: "realEstateOptions",
    options: ["buyVilla", "buyApartment", "annualRent", "holidayHome", "offPlan"],
  },
};

export default function QuoteForm() {
  const t = useTranslations("Quote");
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      fullName: "",
      country: "",
      phone: "",
      email: "",
      service: "",
      subService: "",
      propertyType: "",
      propertyCategory: "",
      dubaiArea: "",
      budget: "",
      bedrooms: "",
      rentalDuration: "",
      travelDate: "",
      travelers: "",
      message: "",
    },
  });

  const { watch, setValue, register, handleSubmit, formState: { errors } } = form;
  const selectedService = watch("service");
  const selectedSubService = watch("subService");

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: QuoteFormValues) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          locale,
        }),
      });
    } catch (err) {
      console.error("Quote submission error:", err);
    } finally {
      setIsSubmitting(false);
      nextStep();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
    }),
  };

  const handleWhatsApp = () => {
    const data = watch();
    const formatted = formatQuoteForWhatsApp(data);
    window.open(getWhatsAppUrl(SITE_CONFIG.contact.whatsapp, formatted), "_blank");
  };

  const currentSubServiceConfig = selectedService ? SUB_SERVICES[selectedService] : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-5 md:p-10 bg-white shadow-2xl rounded-3xl border border-cream-100">
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm",
                  step === i
                    ? "bg-gold-500 text-navy-900 ring-4 ring-gold-100 scale-105"
                    : step > i
                    ? "bg-navy-900 text-gold-400"
                    : "bg-cream-100 text-navy-600"
                )}
              >
                {step > i ? <CheckCircle className="w-5 h-5" /> : i}
              </div>
              <div className="h-1.5 w-full bg-cream-100 mt-3 relative rounded-full overflow-hidden">
                <div
                  className="absolute top-0 start-0 h-full bg-gold-500 transition-all duration-500 rounded-full"
                  style={{ width: step > i ? "100%" : step === i ? "60%" : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-navy-800 font-semibold text-base mt-2">
          {t(`step${step}`)}
        </p>
      </div>

      <div className="relative overflow-hidden min-h-[420px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Select Service */}
              {step === 1 && (
                <div>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-navy-900">
                      {t("selectService")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SERVICES.map((s) => {
                      const Icon = s.icon;
                      const isSelected = selectedService === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setValue("service", s.id);
                            nextStep();
                          }}
                          className={cn(
                            "group p-6 border-2 rounded-2xl flex flex-col items-center justify-between text-center gap-3 transition-all duration-200 text-start",
                            isSelected
                              ? "border-gold-500 bg-gold-50/40 shadow-md ring-2 ring-gold-200"
                              : "border-cream-100 hover:border-gold-400 hover:bg-cream-50/70 hover:shadow-md"
                          )}
                        >
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200",
                            isSelected ? "bg-gold-500 text-navy-900" : "bg-navy-900 text-gold-400"
                          )}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div>
                            <span className="block font-bold text-navy-900 text-lg mb-1">
                              {t(`services.${s.key}.title`)}
                            </span>
                            <span className="text-xs text-navy-600 leading-relaxed block">
                              {t(`services.${s.key}.desc`)}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-gold-600 mt-2 flex items-center gap-1 group-hover:underline">
                            {t("next")} &rarr;
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Sub-Service */}
              {step === 2 && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-navy-900">
                      {t("selectOption")}
                    </h3>
                    <p className="text-sm text-navy-600 mt-1">
                      {selectedService ? t(`services.${selectedService}.title`) : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSubServiceConfig?.options.map((opt) => {
                      const isSelected = selectedSubService === opt;
                      const label = t(`${currentSubServiceConfig.key}.${opt}`);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setValue("subService", opt);
                            nextStep();
                          }}
                          className={cn(
                            "p-5 border-2 rounded-xl text-start flex items-center justify-between transition-all duration-200",
                            isSelected
                              ? "border-gold-500 bg-gold-50/50 shadow-md ring-2 ring-gold-200 font-bold text-navy-900"
                              : "border-cream-100 hover:border-gold-400 hover:bg-cream-50 text-navy-800"
                          )}
                        >
                          <span className="text-base font-semibold leading-snug">{label}</span>
                          <span className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center ms-3 shrink-0",
                            isSelected ? "border-gold-500 bg-gold-500 text-white" : "border-navy-200"
                          )}>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <Button variant="ghost" type="button" onClick={prevStep} className="flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                      {t("back")}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => nextStep()}
                      disabled={!selectedSubService}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Details & Contact */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-navy-900">
                      {t("step3")}
                    </h3>
                    <p className="text-sm text-navy-600 mt-1">
                      {t("validation.required")}
                    </p>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t("fullName")}
                      placeholder={t("form.fullNamePlaceholder")}
                      {...register("fullName")}
                      error={errors.fullName ? t("validation.required") : undefined}
                      required
                    />
                    <Input
                      label={t("country")}
                      placeholder={t("form.countryPlaceholder")}
                      {...register("country")}
                      error={errors.country ? t("validation.required") : undefined}
                      required
                    />
                    <Input
                      label={t("phone")}
                      placeholder={t("form.phonePlaceholder")}
                      dir="ltr"
                      {...register("phone")}
                      error={errors.phone ? t("validation.invalidPhone") : undefined}
                      required
                    />
                    <Input
                      label={t("email")}
                      type="email"
                      placeholder={t("form.emailPlaceholder")}
                      dir="ltr"
                      {...register("email")}
                      error={errors.email ? t("validation.invalidEmail") : undefined}
                      required
                    />
                  </div>

                  {/* Contextual Fields */}
                  {["visa", "hotels", "flights", "tourism"].includes(selectedService) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-cream-100">
                      <Input
                        label={t("travelDate")}
                        type="date"
                        iconStart={<Calendar className="w-4 h-4 text-navy-400" />}
                        {...register("travelDate")}
                      />
                      <Input
                        label={t("travelers")}
                        placeholder={t("form.travelers")}
                        iconStart={<Users className="w-4 h-4 text-navy-400" />}
                        {...register("travelers")}
                      />
                    </div>
                  )}

                  {selectedService === "cars" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-cream-100">
                      <Input
                        label={t("travelDate")}
                        type="date"
                        iconStart={<Calendar className="w-4 h-4 text-navy-400" />}
                        {...register("travelDate")}
                      />
                      <Input
                        label={t("rentalDuration")}
                        placeholder={t("form.rentalDuration")}
                        {...register("rentalDuration")}
                      />
                    </div>
                  )}

                  {selectedService === "realEstate" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-cream-100">
                      <Select
                        label={t("propertyType")}
                        options={[
                          { value: "apartment", label: t("propertyTypes.apartment") },
                          { value: "villa", label: t("propertyTypes.villa") },
                          { value: "penthouse", label: t("propertyTypes.penthouse") },
                          { value: "townhouse", label: t("propertyTypes.townhouse") },
                          { value: "commercial", label: t("propertyTypes.commercial") },
                        ]}
                        {...register("propertyType")}
                      />
                      <Input
                        label={t("dubaiArea")}
                        placeholder={t("form.dubaiArea")}
                        iconStart={<MapPin className="w-4 h-4 text-navy-400" />}
                        {...register("dubaiArea")}
                      />
                      <Input
                        label={t("budget")}
                        placeholder={t("form.budget")}
                        iconStart={<Coins className="w-4 h-4 text-navy-400" />}
                        {...register("budget")}
                      />
                      <Select
                        label={t("bedrooms")}
                        options={[
                          { value: "studio", label: t("bedroomOptions.studio") },
                          { value: "1", label: t("bedroomOptions.1") },
                          { value: "2", label: t("bedroomOptions.2") },
                          { value: "3", label: t("bedroomOptions.3") },
                          { value: "4plus", label: t("bedroomOptions.4plus") },
                        ]}
                        {...register("bedrooms")}
                      />
                    </div>
                  )}

                  <Textarea
                    label={t("message")}
                    placeholder={t("form.messagePlaceholder")}
                    rows={4}
                    {...register("message")}
                    error={errors.message?.message}
                  />

                  <div className="flex justify-between items-center pt-4 border-t border-cream-100">
                    <Button variant="ghost" type="button" onClick={prevStep} className="flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                      {t("back")}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("submitting")}
                        </span>
                      ) : (
                        t("submit")
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-100">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  
                  <div className="max-w-xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">
                      {t("successTitle")}
                    </h2>
                    <p className="text-navy-700 leading-relaxed text-sm md:text-base">
                      {t("successMessage")}
                    </p>
                  </div>
                  
                  {/* Summary Card */}
                  <div className="bg-cream-50/80 p-6 rounded-2xl text-start mx-auto max-w-lg border border-cream-100 shadow-inner space-y-2 text-sm">
                    <div className="flex justify-between border-b border-cream-200 pb-2">
                      <span className="text-navy-600">{t("service")}:</span>
                      <span className="font-bold text-navy-900">
                        {selectedService ? t(`services.${selectedService}.title`) : "-"}
                      </span>
                    </div>
                    {selectedSubService && currentSubServiceConfig && (
                      <div className="flex justify-between border-b border-cream-200 pb-2">
                        <span className="text-navy-600">{t("subService")}:</span>
                        <span className="font-semibold text-gold-600">
                          {t(`${currentSubServiceConfig.key}.${selectedSubService}`)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-cream-200 pb-2">
                      <span className="text-navy-600">{t("name")}:</span>
                      <span className="font-medium text-navy-900">{watch("fullName")}</span>
                    </div>
                    <div className="flex justify-between border-b border-cream-200 pb-2">
                      <span className="text-navy-600">{t("country")}:</span>
                      <span className="font-medium text-navy-900">{watch("country")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-600">{t("phone")}:</span>
                      <span className="font-medium text-navy-900" dir="ltr">{watch("phone")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Button
                      variant="whatsapp"
                      size="lg"
                      type="button"
                      onClick={handleWhatsApp}
                      className="flex items-center gap-2 shadow-lg hover:shadow-xl font-bold px-8 py-3.5"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {t("sendWhatsapp")}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      type="button"
                      onClick={() => {
                        form.reset();
                        setStep(1);
                      }}
                      className="px-6 py-3.5"
                    >
                      {t("newRequest")}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
