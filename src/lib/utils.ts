import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, "");
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const base = `https://wa.me/${cleanPhone}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

export function getCallUrl(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function getEmailUrl(email: string, subject?: string): string {
  const base = `mailto:${email}`;
  if (subject) {
    return `${base}?subject=${encodeURIComponent(subject)}`;
  }
  return base;
}
