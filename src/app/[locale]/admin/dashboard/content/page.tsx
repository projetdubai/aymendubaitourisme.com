'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  RefreshCw, 
  Check, 
  Globe, 
  MousePointerClick, 
  Sparkles, 
  Briefcase, 
  Award, 
  Phone, 
  Building2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  FolderOpen,
  Plus,
  Trash2,
  RotateCcw,
  Languages,
  Loader2,
  Compass,
  Link as LinkIcon
} from 'lucide-react';
import DeployButton from '@/components/admin/DeployButton';
import LivePreviewModal from '@/components/admin/LivePreviewModal';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';
import AutoTranslateButton from '@/components/admin/AutoTranslateButton';

type TabType = 'sections' | 'navbar' | 'buttons' | 'hero' | 'services' | 'whyUs' | 'realEstateReviews' | 'contactFooter';
type LocaleType = 'fr' | 'ar' | 'en';

export default function AdminFullSiteEditor() {
  const [currentLocale, setCurrentLocale] = useState<LocaleType>('fr');
  const [messages, setMessages] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('sections');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Pro features: Live Preview & Media Library
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaCallback, setMediaCallback] = useState<((url: string) => void) | null>(null);
  const [newSectionType, setNewSectionType] = useState('faq');

  const openMediaLibrary = (cb: (url: string) => void) => {
    setMediaCallback(() => cb);
    setIsMediaOpen(true);
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleServicePhotoUpload = async (srvKey: string, file: File) => {
    setUploadingKey(srvKey);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        updateMessage(['Services', srvKey, 'image'], data.url);
        showNotif(`Photo de l'annonce mise à jour ! Cliquez sur Enregistrer.`);
      } else {
        alert(data.error || 'Erreur lors du téléchargement');
      }
    } catch {
      alert("Erreur lors de l'envoi de la photo.");
    } finally {
      setUploadingKey(null);
    }
  };

  const fetchData = useCallback(async (loc: LocaleType) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/site-editor?locale=${loc}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
          setContent(data.content);
        }
      }
    } catch (err) {
      console.error('Failed to load site editor data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentLocale);
  }, [currentLocale, fetchData]);

  const handleSaveAll = async (e?: React.FormEvent, customNote?: string): Promise<boolean> => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/site-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: currentLocale,
          messages,
          content,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Automatic version snapshot in background
        try {
          fetch('/api/admin/versions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              note: customNote || `Mise à jour du contenu & sections (${currentLocale.toUpperCase()})`,
              author: 'Aymen Boulabeiz'
            })
          }).catch(err => console.warn('Snapshot error:', err));
        } catch (e) {
          console.warn('Snapshot error:', e);
        }

        showNotif(data.message || 'Toutes les modifications ont été enregistrées avec succès !');
        return true;
      } else {
        alert(data.message || 'Erreur lors de la sauvegarde.');
        return false;
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de la sauvegarde.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Sections management
  const getSectionsList = () => {
    if (content?.sections && Array.isArray(content.sections)) {
      return [...content.sections].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    }
    return [
      { id: 'hero', name: 'Bannière Hero', enabled: true, order: 0 },
      { id: 'services', name: 'Nos 7 Services Clés', enabled: true, order: 1 },
      { id: 'extra-services', name: 'Services Visas & Régionaux', enabled: true, order: 2 },
      { id: 'founder', name: 'Mot du Fondateur', enabled: true, order: 3 },
      { id: 'why-us', name: 'Pourquoi Nous Choisir', enabled: true, order: 4 },
      { id: 'real-estate', name: 'Immobilier de Prestige', enabled: true, order: 5 },
      { id: 'reviews', name: 'Avis Clients', enabled: true, order: 6 },
      { id: 'faq', name: 'Foire Aux Questions (FAQ)', enabled: true, order: 7 },
      { id: 'promo', name: 'Offre Spéciale & Bannière Promo', enabled: false, order: 8 },
      { id: 'contact', name: 'Formulaire de Contact & Coordonnées', enabled: true, order: 9 }
    ];
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const list = getSectionsList();
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    const reordered = list.map((item, idx) => ({ ...item, order: idx }));
    setContent((prev: any) => ({ ...prev, sections: reordered }));
    showNotif('Ordre des sections mis à jour. Cliquez sur Enregistrer.');
  };

  const toggleSection = (index: number) => {
    const list = getSectionsList();
    list[index] = { ...list[index], enabled: !list[index].enabled };
    setContent((prev: any) => ({ ...prev, sections: list }));
    showNotif(`Section "${list[index].name}" ${list[index].enabled ? 'activée' : 'masquée'}. Cliquez sur Enregistrer.`);
  };

  const updateSectionName = (index: number, name: string) => {
    const list = getSectionsList();
    list[index] = { ...list[index], name };
    setContent((prev: any) => ({ ...prev, sections: list }));
  };

  const handleAddSection = (type: string) => {
    const sectionNames: Record<string, string> = {
      hero: 'Bannière Hero',
      services: 'Nos 7 Services Clés',
      'extra-services': 'Services Visas & Régionaux',
      founder: 'Mot du Fondateur',
      'why-us': 'Pourquoi Nous Choisir',
      'real-estate': 'Immobilier de Prestige',
      reviews: 'Avis Clients',
      faq: 'Foire Aux Questions (FAQ)',
      promo: 'Offre Spéciale & Bannière Promo',
      contact: 'Formulaire de Contact & Coordonnées',
    };

    const list = getSectionsList();
    if (list.some((s: any) => s.id === type)) {
      alert(`Cette section est déjà présente dans votre page.`);
      return;
    }

    const newSec = {
      id: type,
      name: sectionNames[type] || `Nouvelle Section (${type})`,
      enabled: true,
      order: list.length,
    };

    setContent((prev: any) => ({ ...prev, sections: [...list, newSec] }));
    showNotif(`Section "${newSec.name}" ajoutée ! N'oubliez pas d'enregistrer.`);
  };

  const handleDeleteSection = (index: number) => {
    const list = getSectionsList();
    const secName = list[index]?.name;
    if (!window.confirm(`Voulez-vous retirer la section "${secName}" de la page d'accueil ?`)) return;
    const filtered = list.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, order: idx }));
    setContent((prev: any) => ({ ...prev, sections: filtered }));
    showNotif(`Section retirée. Cliquez sur Enregistrer.`);
  };

  // Navbar Links Management
  const DEFAULT_NAVBAR_ITEMS = [
    { id: 'nav-home', href: '/', labelFr: 'Accueil', labelAr: 'الرئيسية', labelEn: 'Home', enabled: true, order: 0 },
    { id: 'nav-services', href: '/services', labelFr: 'Services', labelAr: 'الخدمات', labelEn: 'Services', enabled: true, order: 1 },
    { id: 'nav-visa', href: '/visa', labelFr: 'Visas', labelAr: 'التأشيرات', labelEn: 'Visa', enabled: true, order: 2 },
    { id: 'nav-hotels', href: '/hotels', labelFr: 'Hôtels', labelAr: 'الفنادق', labelEn: 'Hotels', enabled: true, order: 3 },
    { id: 'nav-flights', href: '/flights', labelFr: 'Vols', labelAr: 'الرحلات الجوية', labelEn: 'Flights', enabled: true, order: 4 },
    { id: 'nav-cars', href: '/cars', labelFr: 'Voitures', labelAr: 'السيارات', labelEn: 'Cars', enabled: true, order: 5 },
    { id: 'nav-real-estate', href: '/real-estate', labelFr: 'Immobilier', labelAr: 'العقارات', labelEn: 'Real Estate', enabled: true, order: 6 },
    { id: 'nav-reviews', href: '/reviews', labelFr: 'Avis Clients', labelAr: 'التقييمات', labelEn: 'Reviews', enabled: true, order: 7 },
    { id: 'nav-contact', href: '/contact', labelFr: 'Contact', labelAr: 'اتصل بنا', labelEn: 'Contact', enabled: true, order: 8 }
  ];

  const getNavbarList = () => {
    if (content?.navbar && Array.isArray(content.navbar)) {
      return [...content.navbar].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    }
    return DEFAULT_NAVBAR_ITEMS;
  };

  const moveNavbarItem = (index: number, direction: 'up' | 'down') => {
    const list = getNavbarList();
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    const reordered = list.map((item: any, idx: number) => ({ ...item, order: idx }));
    setContent((prev: any) => ({ ...prev, navbar: reordered }));
    showNotif('Ordre des liens du menu mis à jour. Cliquez sur Enregistrer.');
  };

  const toggleNavbarItem = (index: number) => {
    const list = getNavbarList();
    list[index] = { ...list[index], enabled: list[index].enabled === false ? true : false };
    setContent((prev: any) => ({ ...prev, navbar: list }));
    showNotif(`Lien "${list[index].labelFr || list[index].href}" ${list[index].enabled ? 'activé' : 'masqué'}. Cliquez sur Enregistrer.`);
  };

  const updateNavbarItemField = (index: number, field: string, val: any) => {
    const list = getNavbarList();
    list[index] = { ...list[index], [field]: val };
    setContent((prev: any) => ({ ...prev, navbar: list }));
  };

  const handleAddNavbarItem = () => {
    const list = getNavbarList();
    const newItem = {
      id: `nav-${Date.now()}`,
      href: '/#services',
      labelFr: 'Nouveau lien',
      labelAr: 'رابط جديد',
      labelEn: 'New Link',
      enabled: true,
      order: list.length,
    };
    setContent((prev: any) => ({ ...prev, navbar: [...list, newItem] }));
    showNotif('Nouveau lien ajouté au menu. Personnalisez ses titres et son URL puis enregistrez.');
  };

  const handleDeleteNavbarItem = (index: number) => {
    const list = getNavbarList();
    if (!window.confirm(`Supprimer le lien "${list[index].labelFr || list[index].href}" du menu de navigation ?`)) return;
    const filtered = list.filter((_: any, idx: number) => idx !== index).map((item: any, idx: number) => ({ ...item, order: idx }));
    setContent((prev: any) => ({ ...prev, navbar: filtered }));
    showNotif('Lien supprimé. Cliquez sur Enregistrer.');
  };

  // Helper to update deeply nested message keys safely
  const updateMessage = (path: string[], value: string) => {
    setMessages((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return copy;
    });
  };

  // Helper to update content
  const updateGeneralContent = (field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      general: { ...prev?.general, [field]: value },
    }));
  };

  const updateSocialContent = (field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      socials: { ...prev?.socials, [field]: value },
    }));
  };

  // Automated section batch translation
  const handleTranslateEntireSection = async (sectionKey: string, targetLocale: 'ar' | 'fr' | 'en') => {
    if (!messages?.[sectionKey]) {
      alert('Section introuvable.');
      return;
    }
    setIsTranslating(true);
    try {
      const extractStrings = (obj: any, prefix = ''): Record<string, string> => {
        let res: Record<string, string> = {};
        for (const k in obj) {
          const val = obj[k];
          if (typeof val === 'string' && val.trim() && !val.startsWith('http') && !val.startsWith('/') && !val.includes('@') && !k.toLowerCase().includes('icon')) {
            res[`${prefix}${k}`] = val;
          } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            Object.assign(res, extractStrings(val, `${prefix}${k}.`));
          }
        }
        return res;
      };

      const flat = extractStrings(messages[sectionKey]);
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: flat,
          from: currentLocale,
          to: targetLocale,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.fields) {
        if (targetLocale === currentLocale) {
          const updated = JSON.parse(JSON.stringify(messages));
          for (const pathStr in data.fields) {
            const parts = pathStr.split('.');
            let cur = updated[sectionKey];
            for (let i = 0; i < parts.length - 1; i++) {
              if (!cur[parts[i]]) cur[parts[i]] = {};
              cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = data.fields[pathStr];
          }
          setMessages(updated);
          showNotif(`Section traduite en ${targetLocale.toUpperCase()} !`);
        } else {
          const targetRes = await fetch(`/api/admin/site-editor?locale=${targetLocale}`);
          const targetData = await targetRes.json();
          const targetMsgs = targetData.messages || {};
          if (!targetMsgs[sectionKey]) targetMsgs[sectionKey] = JSON.parse(JSON.stringify(messages[sectionKey]));
          
          for (const pathStr in data.fields) {
            const parts = pathStr.split('.');
            let cur = targetMsgs[sectionKey];
            for (let i = 0; i < parts.length - 1; i++) {
              if (!cur[parts[i]]) cur[parts[i]] = {};
              cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = data.fields[pathStr];
          }

          await fetch('/api/admin/site-editor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              locale: targetLocale,
              messages: targetMsgs,
              content,
            }),
          });
          showNotif(`Section "${sectionKey}" traduite et publiée en direct pour (${targetLocale.toUpperCase()}) !`);
        }
      } else {
        alert(data.error || 'Erreur lors de la traduction.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de la traduction.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Translate all site content between languages
  const handleTranslateEntireSite = async (targetLocale: 'ar' | 'fr' | 'en') => {
    if (targetLocale === currentLocale) {
      alert('Veuillez choisir une autre langue cible.');
      return;
    }
    if (!window.confirm(`Voulez-vous traduire instantanément l'intégralité du site (${currentLocale.toUpperCase()} ➔ ${targetLocale.toUpperCase()}) ? Cette action traduira tous les textes et mettra à jour la version en direct.`)) {
      return;
    }

    setIsTranslating(true);
    try {
      const extractStrings = (obj: any, prefix = ''): Record<string, string> => {
        let res: Record<string, string> = {};
        for (const k in obj) {
          const val = obj[k];
          if (typeof val === 'string' && val.trim() && !val.startsWith('http') && !val.startsWith('/') && !val.includes('@') && !k.toLowerCase().includes('icon')) {
            res[`${prefix}${k}`] = val;
          } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            Object.assign(res, extractStrings(val, `${prefix}${k}.`));
          }
        }
        return res;
      };

      const flat = extractStrings(messages);
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: flat,
          from: currentLocale,
          to: targetLocale,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.fields) {
        const targetRes = await fetch(`/api/admin/site-editor?locale=${targetLocale}`);
        const targetData = await targetRes.json();
        const targetMsgs = targetData.messages || JSON.parse(JSON.stringify(messages));

        for (const pathStr in data.fields) {
          const parts = pathStr.split('.');
          let cur = targetMsgs;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!cur[parts[i]]) cur[parts[i]] = {};
            cur = cur[parts[i]];
          }
          cur[parts[parts.length - 1]] = data.fields[pathStr];
        }

        await fetch('/api/admin/site-editor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locale: targetLocale,
            messages: targetMsgs,
            content,
          }),
        });

        showNotif(`Succès ! L'intégralité du site a été traduite en (${targetLocale.toUpperCase()}) et publiée en direct !`);
      } else {
        alert(data.error || 'Erreur lors de la traduction globale.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de la traduction globale.');
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading && !messages) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-green-600 text-white rounded-xl shadow-xl flex items-center gap-3 animate-fade-in border border-green-500">
          <CheckCircle2 size={22} />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2.5">
            <Globe size={24} className="text-gold-500" />
            Studio de Modification Globale du Site
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Personnalisez tous les boutons, appels à l&apos;action, textes, services et coordonnées en direct.
          </p>
        </div>

        {/* Action Controls & Language Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selector Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            {[
              { id: 'fr' as LocaleType, label: 'Français 🇫🇷' },
              { id: 'ar' as LocaleType, label: 'العربية 🇦🇪' },
              { id: 'en' as LocaleType, label: 'English 🇬🇧' },
            ].map((lang) => (
              <button
                type="button"
                key={lang.id}
                onClick={() => setCurrentLocale(lang.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentLocale === lang.id
                    ? 'bg-navy-900 text-gold-400 shadow-sm'
                    : 'text-gray-600 hover:text-navy-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Quick Auto-Translate Entire Site Dropdown */}
          <div className="relative group">
            <button
              type="button"
              disabled={isTranslating}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-navy-900 text-gold-400 border border-gold-500/40 rounded-xl hover:bg-navy-800 transition-colors shadow-xs cursor-pointer"
              title="Traduire automatiquement tous les textes du site"
            >
              {isTranslating ? (
                <Loader2 size={14} className="animate-spin text-gold-400" />
              ) : (
                <Sparkles size={14} className="text-gold-400" />
              )}
              <span>{isTranslating ? 'Traduction en cours...' : 'Traduire le site'}</span>
            </button>
            <div className="absolute right-0 mt-1 w-52 bg-[#0d1f38] border border-gold-500/30 rounded-xl shadow-xl py-1 z-50 hidden group-hover:block hover:block">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-700">
                Depuis {currentLocale.toUpperCase()} vers :
              </div>
              <button
                type="button"
                onClick={() => handleTranslateEntireSite('ar')}
                disabled={currentLocale === 'ar' || isTranslating}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-gold-500/20 hover:text-gold-400 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-between cursor-pointer"
              >
                <span>🇦🇪 Vers Arabe (العربية)</span>
                <span className="text-[10px] text-gold-500 font-bold">RTL</span>
              </button>
              <button
                type="button"
                onClick={() => handleTranslateEntireSite('fr')}
                disabled={currentLocale === 'fr' || isTranslating}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-gold-500/20 hover:text-gold-400 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-between cursor-pointer"
              >
                <span>🇫🇷 Vers Français</span>
              </button>
              <button
                type="button"
                onClick={() => handleTranslateEntireSite('en')}
                disabled={currentLocale === 'en' || isTranslating}
                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-gold-500/20 hover:text-gold-400 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-between cursor-pointer"
              >
                <span>🇬🇧 Vers English</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchData(currentLocale)}
            disabled={isLoading || isSaving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Recharger
          </button>

          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-navy-900 text-gold-400 hover:bg-navy-800 rounded-xl shadow-xs transition-colors"
            title="Prévisualiser le site en direct dans différents formats (Mobile, Tablette, PC)"
          >
            <Eye size={15} />
            <span>Aperçu en Direct</span>
          </button>

          {/* Media Library Button */}
          <button
            type="button"
            onClick={() => openMediaLibrary(() => {})}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
            title="Ouvrir la médiathèque globale du site"
          >
            <FolderOpen size={14} className="text-gold-600" />
            <span>Médiathèque</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            title="Enregistrer les modifications immédiatement dans le site"
          >
            <Save size={18} />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer (Immédiat)'}</span>
          </button>

          {/* 1-Click Save & Production Deploy to Vercel */}
          <DeployButton variant="saveAndDeploy" onBeforeDeploy={handleSaveAll} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 no-scrollbar">
        {[
          { id: 'sections', label: 'Disposition des Sections', icon: Layers },
          { id: 'navbar', label: 'Barre de Navigation (Navbar)', icon: Compass },
          { id: 'buttons', label: 'Tous les Boutons & CTAs', icon: MousePointerClick },
          { id: 'hero', label: 'Bannière d\'Accueil (Hero)', icon: Sparkles },
          { id: 'services', label: 'Les 7 Services & Descriptions', icon: Briefcase },
          { id: 'whyUs', label: 'Pourquoi Nous Choisir (6 atouts)', icon: Award },
          { id: 'realEstateReviews', label: 'Immobilier & Avis', icon: Building2 },
          { id: 'contactFooter', label: 'Contact, Réseaux & Copyright', icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-navy-900 text-gold-400 shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: DISPOSITION & ORDRE DES SECTIONS MODULAIRES                       */}
      {/* ========================================================================= */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Layers size={20} className="text-gold-500" />
                Disposition & Ordre des Sections de la Page d&apos;Accueil
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Changez l&apos;ordre d&apos;affichage avec les flèches Haut / Bas, ou masquez temporairement un bloc du site public.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Eye size={15} />
                <span>Tester dans l&apos;Aperçu</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const resetList = [
                    { id: 'hero', name: 'Bannière Hero', enabled: true, order: 0 },
                    { id: 'services', name: 'Nos 7 Services Clés', enabled: true, order: 1 },
                    { id: 'extra-services', name: 'Services Visas & Régionaux', enabled: true, order: 2 },
                    { id: 'founder', name: 'Mot du Fondateur', enabled: true, order: 3 },
                    { id: 'why-us', name: 'Pourquoi Nous Choisir', enabled: true, order: 4 },
                    { id: 'real-estate', name: 'Immobilier de Prestige', enabled: true, order: 5 },
                    { id: 'reviews', name: 'Avis Clients', enabled: true, order: 6 },
                    { id: 'faq', name: 'Foire Aux Questions (FAQ)', enabled: true, order: 7 },
                    { id: 'promo', name: 'Offre Spéciale & Bannière Promo', enabled: false, order: 8 },
                    { id: 'contact', name: 'Formulaire de Contact & Coordonnées', enabled: true, order: 9 }
                  ];
                  setContent((prev: any) => ({ ...prev, sections: resetList }));
                  showNotif('Ordre standard réinitialisé. Cliquez sur Enregistrer.');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-navy-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="Rétablir l'ordre d'origine de la page"
              >
                <RotateCcw size={14} />
                <span>Ordre Recommandé</span>
              </button>
            </div>
          </div>

          {/* Sections List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {getSectionsList().map((section: any, index: number, arr: any[]) => {
              const isFirst = index === 0;
              const isLast = index === arr.length - 1;
              const isEnabled = section.enabled !== false;

              return (
                <div
                  key={section.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !isEnabled ? 'bg-gray-50/70 opacity-75' : 'hover:bg-amber-50/20'
                  }`}
                >
                  {/* Left: Reorder Arrows & Info */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    {/* Up / Down Buttons */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveSection(index, 'up')}
                        disabled={isFirst}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-navy-900 hover:text-gold-400 text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        title="Monter d'une position"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(index, 'down')}
                        disabled={isLast}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-navy-900 hover:text-gold-400 text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        title="Descendre d'une position"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Order badge */}
                    <div className="w-8 h-8 rounded-xl bg-navy-900 text-gold-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      #{index + 1}
                    </div>

                    {/* Section Name & ID */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold uppercase">
                          {section.id}
                        </span>
                        {isEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Visible sur le site
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                            Masqué
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={section.name || ''}
                        onChange={(e) => updateSectionName(index, e.target.value)}
                        className="w-full font-bold text-sm text-navy-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gold-500 focus:bg-white focus:outline-none px-1 py-0.5 rounded transition-all"
                        placeholder="Nom de la section"
                      />
                    </div>
                  </div>

                  {/* Right: Toggle Switch & Delete */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleSection(index)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isEnabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span>{isEnabled ? 'Actif' : 'Désactivé'}</span>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Supprimer la section de la page"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Section Box */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Plus size={18} className="text-gold-500" />
              <div>
                <h4 className="text-sm font-bold text-navy-900">Ajouter un bloc à la page</h4>
                <p className="text-xs text-gray-500">Sélectionnez un modèle de section disponible pour l&apos;intégrer à la liste.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value)}
                aria-label="Sélectionner une section à ajouter"
                className="bg-gray-50 border border-gray-200 text-navy-900 text-xs rounded-xl px-3 py-2 font-medium focus:border-gold-500 focus:outline-none"
              >
                <option value="faq">Foire Aux Questions (FAQ)</option>
                <option value="promo">Offre Spéciale & Bannière Promo</option>
                <option value="founder">Mot du Fondateur (Aymen)</option>
                <option value="extra-services">Services Visas Régionaux (Qatar, Oman, etc.)</option>
                <option value="real-estate">Immobilier de Prestige</option>
                <option value="reviews">Avis & Témoignages Clients</option>
                <option value="why-us">Pourquoi Nous Choisir</option>
                <option value="services">Nos 7 Services Clés</option>
                <option value="hero">Bannière Hero d&apos;Accueil</option>
                <option value="contact">Formulaire de Contact</option>
              </select>

              <button
                type="button"
                onClick={() => handleAddSection(newSectionType)}
                className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                <Plus size={14} className="text-gold-400" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: GESTIONNAIRE DE NAVIGATION DYNAMIQUE (NAVBAR)                       */}
      {/* ========================================================================= */}
      {activeTab === 'navbar' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Compass size={20} className="text-gold-500" />
                Gestionnaire de la Barre de Navigation (Navbar)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Contrôlez les liens du menu principal, leurs traductions (FR, AR, EN), leur ordre d&apos;affichage et leur visibilité.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Eye size={15} />
                <span>Tester dans l&apos;Aperçu</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setContent((prev: any) => ({ ...prev, navbar: DEFAULT_NAVBAR_ITEMS }));
                  showNotif('Menu standard réinitialisé. Cliquez sur Enregistrer.');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-navy-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="Rétablir les 9 liens par défaut du menu"
              >
                <RotateCcw size={14} />
                <span>Menu par défaut</span>
              </button>
            </div>
          </div>

          {/* Navbar Links List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {getNavbarList().map((item: any, index: number, arr: any[]) => {
              const isFirst = index === 0;
              const isLast = index === arr.length - 1;
              const isEnabled = item.enabled !== false;

              return (
                <div
                  key={item.id || index}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    !isEnabled ? 'bg-gray-50/70 opacity-75' : 'hover:bg-amber-50/20'
                  }`}
                >
                  {/* Left: Reorder & Number */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveNavbarItem(index, 'up')}
                        disabled={isFirst}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-navy-900 hover:text-gold-400 text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        title="Monter dans le menu"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveNavbarItem(index, 'down')}
                        disabled={isLast}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-navy-900 hover:text-gold-400 text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        title="Descendre dans le menu"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-navy-900 text-gold-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      #{index + 1}
                    </div>

                    <div>
                      {isEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Visible
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-full">
                          Masqué
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: URL, FR, AR, EN inputs */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {/* URL / Anchor */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                        <LinkIcon size={11} />
                        URL / Ancre
                      </label>
                      <input
                        type="text"
                        value={item.href || ''}
                        onChange={(e) => updateNavbarItemField(index, 'href', e.target.value)}
                        placeholder="Ex: /services ou /#cars"
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-navy-900 focus:border-gold-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Label Français */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Libellé Français 🇫🇷
                      </label>
                      <input
                        type="text"
                        value={item.labelFr || ''}
                        onChange={(e) => updateNavbarItemField(index, 'labelFr', e.target.value)}
                        placeholder="Ex: Accueil"
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-navy-900 focus:border-gold-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Label Arabe */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Libellé Arabe 🇦🇪
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={item.labelAr || ''}
                        onChange={(e) => updateNavbarItemField(index, 'labelAr', e.target.value)}
                        placeholder="Ex: الرئيسية"
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-navy-900 focus:border-gold-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Label English */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Libellé Anglais 🇬🇧
                      </label>
                      <input
                        type="text"
                        value={item.labelEn || ''}
                        onChange={(e) => updateNavbarItemField(index, 'labelEn', e.target.value)}
                        placeholder="Ex: Home"
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-navy-900 focus:border-gold-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right: Toggle Switch & Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      type="button"
                      onClick={() => toggleNavbarItem(index)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isEnabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span>{isEnabled ? 'Actif' : 'Désactivé'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNavbarItem(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Supprimer ce lien du menu"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Navbar Link Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Plus size={18} className="text-gold-500" />
              <div>
                <h4 className="text-sm font-bold text-navy-900">Ajouter un lien personnalisé</h4>
                <p className="text-xs text-gray-500">Ajoutez un lien de page interne, une ancre (#services, #cars) ou un lien externe.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddNavbarItem}
              className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              <Plus size={14} className="text-gold-400" />
              <span>Ajouter un lien</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: TOUS LES BOUTONS & CTAs                                           */}
      {/* ========================================================================= */}
      {activeTab === 'buttons' && (
        <div className="space-y-6">
          {/* Header & Navigation Buttons */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <MousePointerClick size={18} className="text-gold-500" />
                  Bouton Principal de l&apos;En-tête (Header)
                </h3>
                <p className="text-xs text-gray-500">Bouton doré présent en permanence en haut à droite du site.</p>
              </div>
              <span className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-600">Header CTA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Texte du bouton Devis</label>
                <input
                  type="text"
                  value={messages?.Navigation?.getQuote || ''}
                  onChange={(e) => updateMessage(['Navigation', 'getQuote'], e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-navy-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Message automatique WhatsApp</label>
                <input
                  type="text"
                  value={messages?.Navigation?.whatsappMessage || ''}
                  onChange={(e) => updateMessage(['Navigation', 'whatsappMessage'], e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <MousePointerClick size={18} className="text-gold-500" />
                  Boutons d&apos;Appel à l&apos;Action de la Page d&apos;Accueil (Hero)
                </h3>
                <p className="text-xs text-gray-500">Les 2 grands boutons situés sous le titre principal de l&apos;accueil.</p>
              </div>
              <span className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-600">Hero Section</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Bouton Principal 1 (Doré - Lien vers /quote)
                </label>
                <input
                  type="text"
                  value={messages?.Hero?.ctaPrimary || ''}
                  onChange={(e) => updateMessage(['Hero', 'ctaPrimary'], e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-navy-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Bouton Secondaire 2 (WhatsApp)
                </label>
                <input
                  type="text"
                  value={messages?.Hero?.ctaSecondary || ''}
                  onChange={(e) => updateMessage(['Hero', 'ctaSecondary'], e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-navy-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Services Cards Buttons */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <MousePointerClick size={18} className="text-gold-500" />
                  Boutons des 7 Cartes de Services (Grille Accueil & Services)
                </h3>
                <p className="text-xs text-gray-500">Les deux boutons présents en bas de chaque carte de service.</p>
              </div>
              <span className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-600">Services Cards</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton &quot;En savoir plus&quot;</label>
                <input
                  type="text"
                  value={messages?.Common?.buttons?.learnMore || ''}
                  onChange={(e) => updateMessage(['Common', 'buttons', 'learnMore'], e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton &quot;Demander un Devis&quot;</label>
                <input
                  type="text"
                  value={messages?.Common?.buttons?.getQuote || ''}
                  onChange={(e) => updateMessage(['Common', 'buttons', 'getQuote'], e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Quote Form Workflow Buttons */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <MousePointerClick size={18} className="text-gold-500" />
                  Boutons du Formulaire Multi-Étapes de Devis (/quote)
                </h3>
                <p className="text-xs text-gray-500">Boutons de navigation entre les étapes et soumission finale.</p>
              </div>
              <span className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-600">Quote Workflow</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton Étape Suivante</label>
                <input
                  type="text"
                  value={messages?.Quote?.next || ''}
                  onChange={(e) => updateMessage(['Quote', 'next'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton Étape Précédente</label>
                <input
                  type="text"
                  value={messages?.Quote?.back || ''}
                  onChange={(e) => updateMessage(['Quote', 'back'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton Valider & Envoyer</label>
                <input
                  type="text"
                  value={messages?.Quote?.submit || ''}
                  onChange={(e) => updateMessage(['Quote', 'submit'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-gold-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton Échanger sur WhatsApp</label>
                <input
                  type="text"
                  value={messages?.Quote?.sendWhatsapp || ''}
                  onChange={(e) => updateMessage(['Quote', 'sendWhatsapp'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-green-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton Nouveau Devis</label>
                <input
                  type="text"
                  value={messages?.Quote?.newRequest || ''}
                  onChange={(e) => updateMessage(['Quote', 'newRequest'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Other CTAs (Reviews & Contact) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <MousePointerClick size={18} className="text-gold-500" />
                Boutons Avis, Contact & Immobilier
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton &quot;Laisser un avis&quot;</label>
                <input
                  type="text"
                  value={messages?.Reviews?.leaveReview || ''}
                  onChange={(e) => updateMessage(['Reviews', 'leaveReview'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton &quot;Envoyer le message&quot; (Contact)</label>
                <input
                  type="text"
                  value={messages?.Common?.form?.submit || ''}
                  onChange={(e) => updateMessage(['Common', 'form', 'submit'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Bouton &quot;Voir toutes les propriétés&quot;</label>
                <input
                  type="text"
                  value={messages?.RealEstate?.viewAll || ''}
                  onChange={(e) => updateMessage(['RealEstate', 'viewAll'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HERO & BANNIÈRE D'ACCUEIL                                         */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Sparkles size={18} className="text-gold-500" />
                Bannière d&apos;Accueil Principale (Hero)
              </h3>
              <p className="text-xs text-gray-500">Textes affichés sur la grande photo de Dubaï en haut de page.</p>
            </div>

            {/* Section-wide translation triggers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTranslateEntireSection('Hero', currentLocale === 'ar' ? 'fr' : 'ar')}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-navy-900 text-gold-400 hover:bg-navy-800 rounded-lg border border-gold-500/40 transition-colors shadow-xs"
              >
                {isTranslating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Traduire Hero vers {currentLocale === 'ar' ? 'Français 🇫🇷' : 'Arabe 🇦🇪'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-navy-900">
                  Grand Titre Accrocheur (Headline)
                </label>
                <AutoTranslateButton
                  sourceText={messages?.Hero?.headline || ''}
                  sourceLocale={currentLocale}
                  showLanguageMenu={true}
                  onTranslated={(text) => updateMessage(['Hero', 'headline'], text)}
                />
              </div>
              <input
                type="text"
                value={messages?.Hero?.headline || ''}
                onChange={(e) => updateMessage(['Hero', 'headline'], e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base font-bold text-navy-900 focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-navy-900">
                  Sous-Titre Descriptif
                </label>
                <AutoTranslateButton
                  sourceText={messages?.Hero?.subtitle || ''}
                  sourceLocale={currentLocale}
                  showLanguageMenu={true}
                  onTranslated={(text) => updateMessage(['Hero', 'subtitle'], text)}
                />
              </div>
              <textarea
                rows={4}
                value={messages?.Hero?.subtitle || ''}
                onChange={(e) => updateMessage(['Hero', 'subtitle'], e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-navy-900">
                  Badge Doré Supérieur
                </label>
                <AutoTranslateButton
                  sourceText={content?.general?.tagline || ''}
                  sourceLocale={currentLocale}
                  showLanguageMenu={true}
                  onTranslated={(text) => updateGeneralContent('tagline', text)}
                />
              </div>
              <input
                type="text"
                value={content?.general?.tagline || ''}
                onChange={(e) => updateGeneralContent('tagline', e.target.value)}
                placeholder="Premium Travel & Hospitality"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LES 7 SERVICES & DESCRIPTIONS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Briefcase size={18} className="text-gold-500" />
                Titres et Descriptions des 7 Services Principaux
              </h3>
              <p className="text-xs text-gray-500">Ces informations sont visibles sur la grille de l&apos;accueil et la page Services.</p>
            </div>

            {/* Section-wide translation trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTranslateEntireSection('Services', currentLocale === 'ar' ? 'fr' : 'ar')}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-navy-900 text-gold-400 hover:bg-navy-800 rounded-lg border border-gold-500/40 transition-colors shadow-xs cursor-pointer"
              >
                {isTranslating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Traduire tous les services vers {currentLocale === 'ar' ? 'Français 🇫🇷' : 'Arabe 🇦🇪'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-navy-900">Titre de la section Services</label>
                <AutoTranslateButton
                  sourceText={messages?.Services?.title || ''}
                  sourceLocale={currentLocale}
                  showLanguageMenu={true}
                  onTranslated={(text) => updateMessage(['Services', 'title'], text)}
                />
              </div>
              <input
                type="text"
                value={messages?.Services?.title || ''}
                onChange={(e) => updateMessage(['Services', 'title'], e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm font-bold"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-navy-900">Sous-titre de la section Services</label>
                <AutoTranslateButton
                  sourceText={messages?.Services?.subtitle || ''}
                  sourceLocale={currentLocale}
                  showLanguageMenu={true}
                  onTranslated={(text) => updateMessage(['Services', 'subtitle'], text)}
                />
              </div>
              <input
                type="text"
                value={messages?.Services?.subtitle || ''}
                onChange={(e) => updateMessage(['Services', 'subtitle'], e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* The 7 Services */}
          <div className="space-y-5">
            {[
              { key: 'dubaiVisa', label: '1. Visa Dubaï' },
              { key: 'visaExtension', label: '2. Extension de Visa' },
              { key: 'hotelBooking', label: '3. Réservation d\'Hôtels' },
              { key: 'flightBooking', label: '4. Réservation de Vols' },
              { key: 'carRental', label: '5. Location de Voitures' },
              { key: 'tourism', label: '6. Services Touristiques aux EAU' },
              { key: 'realEstate', label: '7. Immobilier de Prestige' },
            ].map((srv) => (
              <div key={srv.key} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">{srv.label}</span>
                  <AutoTranslateButton
                    sourceText={`${messages?.Services?.[srv.key]?.title || ''} - ${messages?.Services?.[srv.key]?.description || ''}`}
                    sourceLocale={currentLocale}
                    showLanguageMenu={true}
                    label="Traduire Service"
                    onTranslated={async (_, targetLoc) => {
                      // Translate both title & description for this service
                      const tRes = await fetch('/api/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          fields: {
                            title: messages?.Services?.[srv.key]?.title || '',
                            description: messages?.Services?.[srv.key]?.description || '',
                          },
                          from: currentLocale,
                          to: targetLoc,
                        }),
                      });
                      const tData = await tRes.json();
                      if (tData.success && tData.fields) {
                        if (targetLoc === currentLocale) {
                          updateMessage(['Services', srv.key, 'title'], tData.fields.title);
                          updateMessage(['Services', srv.key, 'description'], tData.fields.description);
                          showNotif(`Service "${srv.label}" mis à jour !`);
                        } else {
                          showNotif(`Traduction vers (${targetLoc.toUpperCase()}) terminée !`);
                        }
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-navy-900">Titre affiché</label>
                      <AutoTranslateButton
                        sourceText={messages?.Services?.[srv.key]?.title || ''}
                        sourceLocale={currentLocale}
                        showLanguageMenu={true}
                        size="xs"
                        label="Traduire"
                        onTranslated={(text) => updateMessage(['Services', srv.key, 'title'], text)}
                      />
                    </div>
                    <input
                      type="text"
                      value={messages?.Services?.[srv.key]?.title || ''}
                      onChange={(e) => updateMessage(['Services', srv.key, 'title'], e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-navy-900">Description courte</label>
                      <AutoTranslateButton
                        sourceText={messages?.Services?.[srv.key]?.description || ''}
                        sourceLocale={currentLocale}
                        showLanguageMenu={true}
                        size="xs"
                        label="Traduire"
                        onTranslated={(text) => updateMessage(['Services', srv.key, 'description'], text)}
                      />
                    </div>
                    <input
                      type="text"
                      value={messages?.Services?.[srv.key]?.description || ''}
                      onChange={(e) => updateMessage(['Services', srv.key, 'description'], e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>

                {/* Photo de l'annonce / service */}
                <div className="pt-3 border-t border-gray-200/70 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-gray-300 bg-gray-100 shrink-0 flex items-center justify-center">
                    {messages?.Services?.[srv.key]?.image ? (
                      <img
                        src={messages.Services[srv.key].image}
                        alt={srv.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={20} className="text-gray-400" />
                    )}
                    {uploadingKey === srv.key && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold">
                        Envoi...
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg transition-colors">
                        <Upload size={13} />
                        <span>Télécharger une photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleServicePhotoUpload(srv.key, file);
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => openMediaLibrary((url) => {
                          updateMessage(['Services', srv.key, 'image'], url);
                          showNotif(`Photo sélectionnée depuis la Médiathèque ! Cliquez sur Enregistrer.`);
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <FolderOpen size={13} />
                        <span>Médiathèque</span>
                      </button>

                      <span className="text-[11px] text-gray-500">ou saisissez un lien direct :</span>
                    </div>
                    <input
                      type="text"
                      placeholder="URL de l'image (ex: https://images.unsplash.com/... ou /uploads/...)"
                      value={messages?.Services?.[srv.key]?.image || ''}
                      onChange={(e) => updateMessage(['Services', srv.key, 'image'], e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: POURQUOI NOUS CHOISIR (WHY CHOOSE US)                             */}
      {/* ========================================================================= */}
      {activeTab === 'whyUs' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Award size={18} className="text-gold-500" />
                Section &quot;Pourquoi Choisir AYMEN DUBAI TOURISME&quot; (6 Atouts)
              </h3>
              <p className="text-xs text-gray-500">Modifiez les arguments forts présentés à vos clients sur la page d&apos;accueil.</p>
            </div>

            <button
              type="button"
              onClick={() => handleTranslateEntireSection('WhyChooseUs', currentLocale === 'ar' ? 'fr' : 'ar')}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-navy-900 text-gold-400 hover:bg-navy-800 rounded-lg border border-gold-500/40 transition-colors shadow-xs cursor-pointer"
            >
              {isTranslating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>Traduire les 6 atouts vers {currentLocale === 'ar' ? 'Français 🇫🇷' : 'Arabe 🇦🇪'}</span>
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-navy-900">Titre de la section</label>
              <AutoTranslateButton
                sourceText={messages?.WhyChooseUs?.title || ''}
                sourceLocale={currentLocale}
                showLanguageMenu={true}
                onTranslated={(text) => updateMessage(['WhyChooseUs', 'title'], text)}
              />
            </div>
            <input
              type="text"
              value={messages?.WhyChooseUs?.title || ''}
              onChange={(e) => updateMessage(['WhyChooseUs', 'title'], e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'professionalService', defaultTitle: 'Service Professionnel & VIP' },
              { key: 'fastResponse', defaultTitle: 'Réactivité Immédiate' },
              { key: 'expertise', defaultTitle: 'Expertise Locale Reconnue' },
              { key: 'personalized', defaultTitle: 'Accompagnement Personnalisé' },
              { key: 'transparent', defaultTitle: 'Transparence Totale' },
              { key: 'completeSolutions', defaultTitle: 'Solutions Clés en Main' },
            ].map((item, idx) => (
              <div key={item.key} className="p-4 border rounded-xl bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900">Atout #{idx + 1}</span>
                  <AutoTranslateButton
                    sourceText={`${messages?.WhyChooseUs?.[item.key]?.title || item.defaultTitle} - ${messages?.WhyChooseUs?.[item.key]?.description || ''}`}
                    sourceLocale={currentLocale}
                    showLanguageMenu={true}
                    size="xs"
                    label="Traduire l'atout"
                    onTranslated={async (_, targetLoc) => {
                      const tRes = await fetch('/api/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          fields: {
                            title: messages?.WhyChooseUs?.[item.key]?.title || item.defaultTitle,
                            description: messages?.WhyChooseUs?.[item.key]?.description || '',
                          },
                          from: currentLocale,
                          to: targetLoc,
                        }),
                      });
                      const tData = await tRes.json();
                      if (tData.success && tData.fields) {
                        if (targetLoc === currentLocale) {
                          updateMessage(['WhyChooseUs', item.key, 'title'], tData.fields.title);
                          updateMessage(['WhyChooseUs', item.key, 'description'], tData.fields.description);
                          showNotif(`Atout #${idx + 1} mis à jour !`);
                        } else {
                          showNotif(`Traduction vers (${targetLoc.toUpperCase()}) terminée !`);
                        }
                      }
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={messages?.WhyChooseUs?.[item.key]?.title || ''}
                    onChange={(e) => updateMessage(['WhyChooseUs', item.key, 'title'], e.target.value)}
                    placeholder={item.defaultTitle}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold bg-white mb-2"
                  />
                  <textarea
                    rows={2}
                    value={messages?.WhyChooseUs?.[item.key]?.description || ''}
                    onChange={(e) => updateMessage(['WhyChooseUs', item.key, 'description'], e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: IMMOBILIER & AVIS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'realEstateReviews' && (
        <div className="space-y-6">
          {/* Real Estate Texts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-navy-900 border-b pb-3">
              Section Vitrine Immobilière
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-navy-900">Grand Titre</label>
                  <AutoTranslateButton
                    sourceText={messages?.RealEstate?.headline || ''}
                    sourceLocale={currentLocale}
                    showLanguageMenu={true}
                    onTranslated={(text) => updateMessage(['RealEstate', 'headline'], text)}
                  />
                </div>
                <input
                  type="text"
                  value={messages?.RealEstate?.headline || ''}
                  onChange={(e) => updateMessage(['RealEstate', 'headline'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-navy-900">Sous-titre descriptif</label>
                  <AutoTranslateButton
                    sourceText={messages?.RealEstate?.subheadline || ''}
                    sourceLocale={currentLocale}
                    showLanguageMenu={true}
                    onTranslated={(text) => updateMessage(['RealEstate', 'subheadline'], text)}
                  />
                </div>
                <input
                  type="text"
                  value={messages?.RealEstate?.subheadline || ''}
                  onChange={(e) => updateMessage(['RealEstate', 'subheadline'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Reviews Texts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-navy-900 border-b pb-3">
              Section Témoignages & Avis Clients
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-navy-900">Titre de la section</label>
                  <AutoTranslateButton
                    sourceText={messages?.Reviews?.title || ''}
                    sourceLocale={currentLocale}
                    showLanguageMenu={true}
                    onTranslated={(text) => updateMessage(['Reviews', 'title'], text)}
                  />
                </div>
                <input
                  type="text"
                  value={messages?.Reviews?.title || ''}
                  onChange={(e) => updateMessage(['Reviews', 'title'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-semibold"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-navy-900">Sous-titre de la section</label>
                  <AutoTranslateButton
                    sourceText={messages?.Reviews?.subtitle || ''}
                    sourceLocale={currentLocale}
                    showLanguageMenu={true}
                    onTranslated={(text) => updateMessage(['Reviews', 'subtitle'], text)}
                  />
                </div>
                <input
                  type="text"
                  value={messages?.Reviews?.subtitle || ''}
                  onChange={(e) => updateMessage(['Reviews', 'subtitle'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONTACT, RÉSEAUX & COPYRIGHT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'contactFooter' && (
        <div className="space-y-6">
          {/* Official Contact Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-navy-900 border-b pb-3">
              Coordonnées Officielles de l&apos;Agence
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Numéro WhatsApp Officiel</label>
                <input
                  type="text"
                  value={content?.general?.whatsapp || ''}
                  onChange={(e) => updateGeneralContent('whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="+971543770253"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Numéro de Téléphone (Affichage)</label>
                <input
                  type="text"
                  value={content?.general?.phone || ''}
                  onChange={(e) => updateGeneralContent('phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="+971 54 377 0253"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Email Officiel</label>
                <input
                  type="email"
                  value={content?.general?.email || ''}
                  onChange={(e) => updateGeneralContent('email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Adresse Physique</label>
                <input
                  type="text"
                  value={content?.general?.address || ''}
                  onChange={(e) => updateGeneralContent('address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer & Copyright */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-navy-900 border-b pb-3">
              Pied de Page & Mention de Copyright
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Mention de Copyright (avec {'{year}'} pour l&apos;année automatique)
                </label>
                <input
                  type="text"
                  value={messages?.Footer?.copyright || content?.general?.copyright || ''}
                  onChange={(e) => {
                    updateMessage(['Footer', 'copyright'], e.target.value);
                    updateGeneralContent('copyright', e.target.value);
                  }}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm font-bold text-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Description dans le Footer</label>
                <textarea
                  rows={2}
                  value={messages?.Footer?.description || ''}
                  onChange={(e) => updateMessage(['Footer', 'description'], e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Socials */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-base font-bold text-navy-900 border-b pb-3">
              Liens des Réseaux Sociaux
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Instagram</label>
                <input
                  type="url"
                  value={content?.socials?.instagram || ''}
                  onChange={(e) => updateSocialContent('instagram', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">TikTok</label>
                <input
                  type="url"
                  value={content?.socials?.tiktok || ''}
                  onChange={(e) => updateSocialContent('tiktok', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Snapchat</label>
                <input
                  type="url"
                  value={content?.socials?.snapchat || ''}
                  onChange={(e) => updateSocialContent('snapchat', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Facebook</label>
                <input
                  type="url"
                  value={content?.socials?.facebook || ''}
                  onChange={(e) => updateSocialContent('facebook', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-navy-900 mb-1">YouTube</label>
                <input
                  type="url"
                  value={content?.socials?.youtube || ''}
                  onChange={(e) => updateSocialContent('youtube', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 flex justify-between items-center bg-navy-900 text-white p-4 rounded-2xl shadow-2xl border border-gold-500/30">
        <div className="flex items-center gap-2 text-xs text-cream-100/80">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Éditeur connecté • Langue active : <strong>{currentLocale.toUpperCase()}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-navy-800 hover:bg-navy-700 text-gold-400 font-bold text-xs rounded-xl border border-gold-500/20 transition-all"
          >
            <Eye size={15} />
            <span>Aperçu en Direct</span>
          </button>

          <button
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <Save size={17} />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer et Publier Immédiatement'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Modal */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        defaultLocale={currentLocale}
      />

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(url) => {
          if (mediaCallback) mediaCallback(url);
          showNotif(`Image sélectionnée : ${url}`);
        }}
      />
    </div>
  );
}
