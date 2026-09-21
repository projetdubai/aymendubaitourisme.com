'use client';

import { usePathname } from 'next/navigation';
import DeployButton from '@/components/admin/DeployButton';

export default function AdminHeader() {
  const pathname = usePathname();
  
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  let title = 'Tableau de bord';
  if (lastSegment === 'cars') title = 'Parc Automobile & Voitures';
  else if (lastSegment === 'content') title = 'Modifier le Site & Boutons';
  else if (lastSegment === 'media') title = 'Médiathèque Globale';
  else if (lastSegment === 'versions') title = 'Versions & Restauration';
  else if (lastSegment === 'admins') title = 'Gestion des Administrateurs';
  else if (lastSegment === 'quotes') title = 'Demandes de Devis';
  else if (lastSegment === 'reviews') title = 'Modération des Avis Clients';
  else if (lastSegment === 'properties') title = 'Gestion Immobilière';
  else if (lastSegment === 'dashboard') title = 'Aperçu Général';
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:ps-6 ps-16 shrink-0 shadow-xs">
      <h1 className="text-lg font-bold text-navy-900">{title}</h1>
      
      <div className="flex items-center gap-3 sm:gap-4">
        {/* 1-Click Deploy Vercel Prod Button */}
        <DeployButton variant="header" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-500 flex items-center justify-center font-bold text-xs border border-gold-500/30">
            AD
          </div>
          <span className="text-sm font-semibold hidden md:block text-navy-900">Aymen Boulabeiz</span>
        </div>
      </div>
    </header>
  );
}
