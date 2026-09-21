import { z } from "zod";

export const quoteFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  country: z.string().min(1, { message: "Country is required" }),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{6,20}$/, { message: "Please enter a valid phone number" }),
  email: z.string().email({ message: "Invalid email address" }),
  service: z.string().min(1, { message: "Service is required" }),
  subService: z.string().optional(),
  propertyType: z.string().optional(),
  propertyCategory: z.string().optional(),
  dubaiArea: z.string().optional(),
  budget: z.string().optional(),
  bedrooms: z.string().optional(),
  rentalDuration: z.string().optional(),
  travelDate: z.string().optional(),
  travelers: z.string().optional(),
  message: z.string().optional(),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export const reviewFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  country: z.string().min(1, { message: "Country is required" }),
  rating: z.number().min(1).max(5),
  review: z.string().min(10, { message: "Review must be at least 10 characters" }),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
