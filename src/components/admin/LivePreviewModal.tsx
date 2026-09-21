'use client';

import React, { useState } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCw, 
  ExternalLink, 
  X,
  Globe
} from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocale?: string;
}

export default function LivePreviewModal({
  isOpen,
  onClose,
  defaultLocale = 'fr'
}: LivePreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [locale, setLocale] = useState<string>(defaultLocale);
  const [path, setPath] = useState<string>('');
  const [iframeKey, setIframeKey] = useState<number>(0);

  if (!isOpen) return null;

  const currentUrl = `/${locale}${path ? (path.startsWith('/') ? path : '/' + path) : ''}`;

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const getDeviceWidthClass = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] h-[720px] rounded-3xl border-4 border-navy-700 shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[820px] rounded-2xl border-4 border-navy-700 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-full rounded-lg border border-navy-800 shadow-xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col">
      {/* Top Controls Bar */}
      <header className="h-16 bg-navy-950 border-b border-navy-800 px-4 flex items-center justify-between gap-4 select-none shrink-0">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white font-bold text-sm tracking-wide">
            Aperçu en Direct du Site
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
            Temps Réel
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-navy-900 border border-navy-800 rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              device === 'desktop'
                ? 'bg-gold-500 text-navy-950 font-bold shadow-sm'
                : 'text-cream-100/70 hover:text-white hover:bg-navy-800'
            }`}
            title="Bureau (100%)"
          >
            <Monitor size={16} />
            <span className="hidden md:inline">Bureau</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              device === 'tablet'
                ? 'bg-gold-500 text-navy-950 font-bold shadow-sm'
                : 'text-cream-100/70 hover:text-white hover:bg-navy-800'
            }`}
            title="Tablette (768px)"
          >
            <Tablet size={16} />
            <span className="hidden md:inline">Tablette</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              device === 'mobile'
                ? 'bg-gold-500 text-navy-950 font-bold shadow-sm'
                : 'text-cream-100/70 hover:text-white hover:bg-navy-800'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone size={16} />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Navigation & Language Selectors */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe size={14} className="absolute left-2.5 text-gold-400 pointer-events-none" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              aria-label="Langue du site"
              className="bg-navy-900 border border-navy-800 text-cream-100 text-xs rounded-xl pl-8 pr-3 py-2 focus:border-gold-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="fr">Français (FR)</option>
              <option value="ar">العربية (AR)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>

          {/* Route selector */}
          <select
            value={path}
            onChange={(e) => setPath(e.target.value)}
            aria-label="Page à prévisualiser"
            className="hidden lg:inline-block bg-navy-900 border border-navy-800 text-cream-100 text-xs rounded-xl px-3 py-2 focus:border-gold-500 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Page d&apos;accueil</option>
            <option value="/cars">Voitures & Flotte</option>
            <option value="/flights">Vols & Billetterie</option>
            <option value="/services">Tous les Services</option>
            <option value="/contact">Contact</option>
          </select>

          {/* Reload button */}
          <button
            type="button"
            onClick={reloadIframe}
            className="p-2 rounded-xl bg-navy-900 border border-navy-800 text-cream-100/80 hover:text-white hover:bg-navy-800 transition-colors"
            title="Actualiser la prévisualisation"
          >
            <RotateCw size={16} />
          </button>

          {/* Open in new tab */}
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-navy-900 border border-navy-800 text-cream-100/80 hover:text-gold-400 hover:bg-navy-800 transition-colors hidden sm:flex items-center"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={16} />
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all ml-2"
            title="Fermer (ESC)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Frame Container */}
      <div className="flex-1 overflow-auto bg-navy-950/80 flex items-center justify-center p-4 sm:p-6">
        <div className={`transition-all duration-300 flex flex-col bg-white overflow-hidden ${getDeviceWidthClass()}`}>
          {/* Simulated Browser Address Bar for tablet / mobile */}
          {device !== 'desktop' && (
            <div className="h-9 bg-navy-900 px-3 flex items-center justify-between border-b border-navy-800 shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="text-[11px] text-cream-100/60 font-mono truncate px-2 max-w-[200px]">
                aymendubaitourisme.com{currentUrl}
              </div>
              <div className="w-6" />
            </div>
          )}

          {/* Iframe */}
          <iframe
            key={iframeKey}
            src={currentUrl}
            title="Aperçu du site"
            className="w-full flex-1 border-0 bg-navy-950"
          />
        </div>
      </div>
    </div>
  );
}
