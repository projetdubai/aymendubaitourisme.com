import { QuoteFormValues } from "./validations";

export function formatQuoteForWhatsApp(data: QuoteFormValues): string {
  let message = `🌟 *New Quote Request*\n───────────────\n`;
  
  if (data.fullName) message += `👤 *Name:* ${data.fullName}\n`;
  if (data.country) message += `🌍 *Country:* ${data.country}\n`;
  if (data.phone) message += `📱 *Phone:* ${data.phone}\n`;
  if (data.email) message += `📧 *Email:* ${data.email}\n`;
  
  message += `───────────────\n`;
  if (data.service) message += `🛠️ *Service:* ${data.service}\n`;
  if (data.subService) message += `📋 *Type:* ${data.subService}\n`;
  if (data.propertyCategory) message += `🏢 *Category:* ${data.propertyCategory}\n`;
  if (data.propertyType) message += `🏠 *Property Type:* ${data.propertyType}\n`;
  if (data.dubaiArea) message += `📍 *Area:* ${data.dubaiArea}\n`;
  if (data.budget) message += `💰 *Budget:* ${data.budget}\n`;
  if (data.bedrooms) message += `🛏️ *Bedrooms:* ${data.bedrooms}\n`;
  if (data.rentalDuration) message += `⏱️ *Duration:* ${data.rentalDuration}\n`;
  if (data.travelDate) message += `📅 *Date:* ${data.travelDate}\n`;
  if (data.travelers) message += `👥 *Travelers:* ${data.travelers}\n`;
  
  if (data.message) {
    message += `───────────────\n📝 *Message:* ${data.message}\n`;
  }
  
  return message;
}
