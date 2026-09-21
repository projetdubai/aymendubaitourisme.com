'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BedDouble, Bath, Maximize2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// Sample data
const PROPERTIES = [
  {
    id: '1',
    title: 'Downtown Luxury Apartment',
    type: 'Apartments',
    purpose: 'Rent',
    furnishing: 'Furnished',
    status: 'Ready',
    price: '120,000',
    currency: 'AED/year',
    location: 'Downtown Dubai',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,200',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Marina Waterfront View',
    type: 'Apartments',
    purpose: 'Rent',
    furnishing: 'Unfurnished',
    status: 'Ready',
    price: '85,000',
    currency: 'AED/year',
    location: 'Dubai Marina',
    bedrooms: 1,
    bathrooms: 1,
    area: '850',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Palm Jumeirah Signature Villa',
    type: 'Villas',
    purpose: 'Rent',
    furnishing: 'Furnished',
    status: 'Ready',
    price: '450,000',
    currency: 'AED/year',
    location: 'Palm Jumeirah',
    bedrooms: 5,
    bathrooms: 6,
    area: '6,500',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Business Bay Modern Apartment',
    type: 'Apartments',
    purpose: 'Buy',
    furnishing: 'Unfurnished',
    status: 'Ready',
    price: '1,800,000',
    currency: 'AED',
    location: 'Business Bay',
    bedrooms: 2,
    bathrooms: 3,
    area: '1,450',
    image: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '5',
    title: 'Dubai Hills Estate Family Home',
    type: 'Villas',
    purpose: 'Buy',
    furnishing: 'Unfurnished',
    status: 'Ready',
    price: '5,200,000',
    currency: 'AED',
    location: 'Dubai Hills Estate',
    bedrooms: 4,
    bathrooms: 5,
    area: '4,800',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '6',
    title: 'JVC Cozy Studio',
    type: 'Apartments',
    purpose: 'Rent',
    furnishing: 'Unfurnished',
    status: 'Ready',
    price: '45,000',
    currency: 'AED/year',
    location: 'Jumeirah Village Circle',
    bedrooms: 0,
    bathrooms: 1,
    area: '450',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '7',
    title: 'DAMAC Hills Contemporary Villa',
    type: 'Villas',
    purpose: 'Buy',
    furnishing: 'Unfurnished',
    status: 'Off-plan',
    price: '2,400,000',
    currency: 'AED',
    location: 'DAMAC Hills',
    bedrooms: 3,
    bathrooms: 4,
    area: '3,200',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '8',
    title: 'Al Barsha Serviced Apartment',
    type: 'Apartments',
    purpose: 'Rent',
    furnishing: 'Furnished',
    status: 'Ready',
    price: '65,000',
    currency: 'AED/year',
    location: 'Al Barsha',
    bedrooms: 1,
    bathrooms: 2,
    area: '900',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c0?q=80&w=600&auto=format&fit=crop',
  },
];

function mapPropertyItem(p: any) {
  return {
    id: p.id,
    title: p.title,
    type: p.type === 'Villa' || p.type === 'Villas' ? 'Villas' : (p.type === 'Bureau' || p.type === 'Commercial' ? 'Commercial' : 'Apartments'),
    purpose: p.category === 'Vente' || p.category === 'Buy' || p.category === 'SALE' ? 'Buy' : 'Rent',
    furnishing: 'Furnished',
    status: 'Ready',
    price: p.price ? p.price.replace(/[^\d,]/g, '') || p.price : 'Sur demande',
    currency: p.category === 'Vente' || p.category === 'Buy' || p.category === 'SALE' ? 'AED' : 'AED/an',
    location: p.location || 'Dubai',
    bedrooms: Number(p.bedrooms) || 2,
    bathrooms: Number(p.bathrooms) || 2,
    area: p.area ? p.area.replace(/[^\d,]/g, '') || p.area : '1,200',
    image: p.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop',
  };
}

interface RealEstateProps {
  initialProperties?: any[];
  locale?: string;
}

export function RealEstate({ initialProperties }: RealEstateProps = {}) {
  const t = useTranslations('RealEstate');
  const tCommon = useTranslations('Common');
  
  const [propertiesList, setPropertiesList] = useState<any[]>(() => {
    if (initialProperties && initialProperties.length > 0) {
      const activeProps = initialProperties.filter((p: any) => p.status === 'Active' || p.active !== false);
      if (activeProps.length > 0) {
        return activeProps.map(mapPropertyItem);
      }
    }
    return PROPERTIES;
  });
  const [purposeFilter, setPurposeFilter] = useState<'All' | 'Rent' | 'Buy'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Apartments' | 'Villas' | 'Commercial'>('All');
  const [furnishingFilter, setFurnishingFilter] = useState<'All' | 'Furnished' | 'Unfurnished'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Ready' | 'Off-plan'>('All');

  useEffect(() => {
    async function loadDynamicProperties() {
      try {
        const res = await fetch('/api/admin/properties', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
            const mapped = data.properties
              .filter((p: any) => p.status === 'Active' || p.active !== false)
              .map(mapPropertyItem);

            // Merge dynamic admin properties with defaults without duplicates
            setPropertiesList((prev) => {
              const existingIds = new Set(mapped.map((m: any) => m.id));
              const remainingDefaults = prev.filter((p) => !existingIds.has(p.id));
              return [...mapped, ...remainingDefaults];
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic properties:', err);
      }
    }

    loadDynamicProperties();
  }, []);


  const filteredProperties = propertiesList.filter((property) => {
    if (purposeFilter !== 'All' && property.purpose !== purposeFilter) return false;
    if (typeFilter !== 'All' && property.type !== typeFilter) return false;
    if (furnishingFilter !== 'All' && property.furnishing !== furnishingFilter) return false;
    if (statusFilter !== 'All' && property.status !== statusFilter) return false;
    return true;
  });

  return (
    <section className="py-16 bg-cream-50" id="real-estate">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            {t('headline', { fallback: 'Find Your Next Property in Dubai' })}
          </h2>
          <p className="text-navy-700 max-w-2xl mx-auto">
            {t('subheadline', { fallback: 'Explore our handpicked selection of premium properties for sale and rent.' })}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 sm:justify-center">
            <Button
              variant={purposeFilter === 'All' ? 'primary' : 'outline'}
              onClick={() => setPurposeFilter('All')}
              className="whitespace-nowrap"
            >
              {t('filters.all', { fallback: 'All' })}
            </Button>
            <Button
              variant={purposeFilter === 'Buy' ? 'primary' : 'outline'}
              onClick={() => setPurposeFilter('Buy')}
              className="whitespace-nowrap"
            >
              {t('filters.buy', { fallback: 'Buy' })}
            </Button>
            <Button
              variant={purposeFilter === 'Rent' ? 'primary' : 'outline'}
              onClick={() => setPurposeFilter('Rent')}
              className="whitespace-nowrap"
            >
              {t('filters.rent', { fallback: 'Rent' })}
            </Button>
          </div>

          <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 sm:justify-center">
            {['All', 'Apartments', 'Villas', 'Commercial'].map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? 'primary' : 'ghost'}
                onClick={() => setTypeFilter(type as any)}
                className="whitespace-nowrap"
                size="sm"
              >
                {t(`types.${type.toLowerCase()}`, { fallback: type })}
              </Button>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
             <div className="flex bg-white rounded-full p-1 border border-cream-100">
               <button
                 className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", furnishingFilter === 'All' ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-cream-50")}
                 onClick={() => setFurnishingFilter('All')}
               >
                 All
               </button>
               <button
                 className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", furnishingFilter === 'Furnished' ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-cream-50")}
                 onClick={() => setFurnishingFilter('Furnished')}
               >
                 {t('filters.furnished', { fallback: 'Furnished' })}
               </button>
               <button
                 className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", furnishingFilter === 'Unfurnished' ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-cream-50")}
                 onClick={() => setFurnishingFilter('Unfurnished')}
               >
                 {t('filters.unfurnished', { fallback: 'Unfurnished' })}
               </button>
             </div>

             <div className="flex bg-white rounded-full p-1 border border-cream-100">
               <button
                 className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", statusFilter === 'All' ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-cream-50")}
                 onClick={() => setStatusFilter('All')}
               >
                 All
               </button>
               <button
                 className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", statusFilter === 'Ready' ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-cream-50")}
                 onClick={() => setStatusFilter('Ready')}
               >
                 {t('filters.ready', { fallback: 'Ready' })}
               </button>
               <button
                 className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", statusFilter === 'Off-plan' ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-cream-50")}
                 onClick={() => setStatusFilter('Off-plan')}
               >
                 {t('filters.offPlan', { fallback: 'Off-plan' })}
               </button>
             </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden h-full flex flex-col group bg-white border-cream-100">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 start-3">
                      <Badge variant={property.purpose === 'Buy' ? 'gold' : 'default'} className="shadow-md">
                        {t(`purpose.${property.purpose.toLowerCase()}`, { fallback: property.purpose })}
                      </Badge>
                    </div>
                    <div className="absolute top-3 end-3">
                      <Badge variant="info" className="shadow-md">
                        {t(`furnishing.${property.furnishing.toLowerCase()}`, { fallback: property.furnishing })}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-navy-900 mb-2 line-clamp-1">{property.title}</h3>
                    
                    <div className="flex items-center text-navy-700 mb-4 text-sm">
                      <MapPin className="w-4 h-4 me-1 flex-shrink-0 text-gold-500" />
                      <span className="truncate">{property.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-y border-cream-100 mb-4 text-sm text-navy-800">
                      <div className="flex items-center" title="Bedrooms">
                        <BedDouble className="w-4 h-4 me-1.5 text-navy-700" />
                        <span>{property.bedrooms > 0 ? property.bedrooms : 'Studio'}</span>
                      </div>
                      <div className="flex items-center" title="Bathrooms">
                        <Bath className="w-4 h-4 me-1.5 text-navy-700" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center" title="Area (sqft)">
                        <Maximize2 className="w-4 h-4 me-1.5 text-navy-700" />
                        <span dir="ltr">{property.area} sqft</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <p className="text-xs text-navy-700 uppercase tracking-wider mb-1">
                          {property.purpose === 'Buy' ? t('price', { fallback: 'Price' }) : t('rent', { fallback: 'Rent' })}
                        </p>
                        <div className="font-bold text-xl text-gold-500 flex items-baseline gap-1" dir="ltr">
                          <span>{property.price}</span>
                          <span className="text-sm font-medium text-navy-800">{property.currency}</span>
                        </div>
                      </div>
                      <Button variant="primary" size="sm">
                        {tCommon('getQuote', { fallback: 'Get Quote' })}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-navy-700 text-lg">
              {t('noResults', { fallback: 'No properties match your current filters.' })}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setPurposeFilter('All');
                setTypeFilter('All');
                setFurnishingFilter('All');
                setStatusFilter('All');
              }}
            >
              {t('clearFilters', { fallback: 'Clear Filters' })}
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/real-estate">
            <Button variant="outline" size="lg" className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white">
              {t('viewAll', { fallback: 'View All Properties' })}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
