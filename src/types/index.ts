export interface PropertyData {
  id: string;
  title: string;
  description?: string;
  type: "apartment" | "villa" | "commercial";
  category: "rent" | "sale";
  furnished: boolean;
  readyToMove: boolean;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  currency: string;
  images: string[];
  featured: boolean;
}

export interface ReviewData {
  id: string;
  name: string;
  country: string;
  rating: number;
  review: string;
  photo?: string;
  createdAt: string;
}

export interface QuoteFormData {
  fullName: string;
  country: string;
  phone: string;
  email: string;
  service: string;
  subService?: string;
  propertyType?: string;
  propertyCategory?: string;
  dubaiArea?: string;
  budget?: string;
  bedrooms?: number;
  rentalDuration?: string;
  travelDate?: string;
  travelers?: number;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ReviewFormData {
  name: string;
  country: string;
  rating: number;
  review: string;
  photo?: string;
}

export interface ServiceData {
  slug: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

export interface AdminStats {
  totalQuotes: number;
  pendingQuotes: number;
  totalReviews: number;
  pendingReviews: number;
  activeProperties: number;
  totalContacts: number;
  unreadContacts: number;
}
