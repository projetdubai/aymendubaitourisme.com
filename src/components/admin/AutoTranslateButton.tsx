'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, Globe } from 'lucide-react';

interface AutoTranslateButtonProps {
  sourceText: string;
  targetLocale?: 'ar' | 'fr' | 'en';
  sourceLocale?: 'auto' | 'ar' | 'fr' | 'en';
  onTranslated: (translatedText: string, targetLocale: string) => void;
  className?: string;
  size?: 'xs' | 'sm' | 'default';
  label?: string;
  showLanguageMenu?: boolean;
}

export default function AutoTranslateButton({
  sourceText,
  targetLocale,
  sourceLocale = 'auto',
  onTranslated,
  className = '',
  size = 'xs',
  label,
  showLanguageMenu = false,
}: AutoTranslateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTranslate = async (target: 'ar' | 'fr' | 'en') => {
    if (!sourceText || !sourceText.trim()) {
      alert('Veuillez d\'abord saisir un texte source à traduire.');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          from: sourceLocale,
          to: target,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.text) {
        onTranslated(data.text, target);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        alert(data.error || 'Erreur lors de la traduction automatique.');
      }
    } catch (err) {
      console.error('Translation failed:', err);
      alert('Erreur réseau lors de la traduction.');
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  const getTargetLabel = (loc?: 'ar' | 'fr' | 'en') => {
    switch (loc) {
      case 'ar':
        return 'عربي (Arabe)';
      case 'fr':
        return 'Français';
      case 'en':
        return 'English';
      default:
        return 'Auto Traduire';
    }
  };

  // Base sizing
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    default: 'px-3 py-2 text-sm gap-2',
  }[size];

  // If a specific target locale is locked
  if (targetLocale && !showLanguageMenu) {
    return (
      <button
        type="button"
        onClick={() => handleTranslate(targetLocale)}
        disabled={loading || !sourceText}
        title={`Traduire automatiquement en ${targetLocale.toUpperCase()}`}
        className={`inline-flex items-center rounded-md font-medium transition-all duration-200 ${
          success
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-primary-950/70 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 hover:border-gold-500/60'
        } ${!sourceText ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${sizeClasses} ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
        ) : success ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
        )}
        <span>{label || (success ? 'Traduit !' : `Traduire en ${targetLocale.toUpperCase()}`)}</span>
      </button>
    );
  }

  // Interactive dropdown menu for multiple target languages
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={loading || !sourceText}
        className={`inline-flex items-center rounded-md font-medium transition-all duration-200 ${
          success
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-primary-950/80 hover:bg-gold-500/20 text-gold-400 border border-gold-500/40 hover:border-gold-500'
        } ${!sourceText ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${sizeClasses} ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
        ) : success ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Globe className="w-3.5 h-3.5 text-gold-400" />
        )}
        <span>{label || (success ? 'Traduit !' : 'Traduire en...')}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-md shadow-xl bg-[#0d1f38] border border-gold-500/30 ring-1 ring-black/50 z-50 py-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-700/60 uppercase tracking-wider">
            Traduire vers :
          </div>
          <button
            type="button"
            onClick={() => handleTranslate('ar')}
            className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-gold-500/20 hover:text-gold-400 flex items-center justify-between transition-colors"
          >
            <span>🇸🇦 العربية (Arabe)</span>
            <span className="text-[10px] text-slate-400">RTL</span>
          </button>
          <button
            type="button"
            onClick={() => handleTranslate('fr')}
            className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-gold-500/20 hover:text-gold-400 flex items-center justify-between transition-colors"
          >
            <span>🇫🇷 Français</span>
          </button>
          <button
            type="button"
            onClick={() => handleTranslate('en')}
            className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-gold-500/20 hover:text-gold-400 flex items-center justify-between transition-colors"
          >
            <span>🇬🇧 English</span>
          </button>
        </div>
      )}
    </div>
  );
}
