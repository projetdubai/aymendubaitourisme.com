'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Check, 
  X, 
  FolderOpen,
  Eye,
  RefreshCw,
  FileText,
  Plane,
  Hotel,
  Car,
  Building2,
  Compass,
  Anchor,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { TourismServiceItem } from '@/lib/services';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';
import AutoTranslateButton from '@/components/admin/AutoTranslateButton';

const ICON_OPTIONS = [
  { id: 'FileText', label: 'Visas (FileText)', icon: FileText },
  { id: 'Plane', label: 'Vols & Billetterie (Plane)', icon: Plane },
  { id: 'Hotel', label: 'Hôtels (Hotel)', icon: Hotel },
  { id: 'Car', label: 'Voitures (Car)', icon: Car },
  { id: 'Building2', label: 'Immobilier (Building2)', icon: Building2 },
  { id: 'Compass', label: 'Safari & Excursions (Compass)', icon: Compass },
  { id: 'Anchor', label: 'Yachts & Mer (Anchor)', icon: Anchor },
  { id: 'ShieldCheck', label: 'Conciergerie & VIP (ShieldCheck)', icon: ShieldCheck },
  { id: 'Sparkles', label: 'Prestige / Étoiles (Sparkles)', icon: Sparkles },
];

export default function DashboardServicesPage() {
  const [services, setServices] = useState<TourismServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<TourismServiceItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'fr' | 'ar' | 'en'>('fr');
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    id: '',
    slug: '',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    priceStartingFrom: '',
    ctaLink: '/quote',
    active: true,
    order: 1,
    title_fr: '',
    title_ar: '',
    title_en: '',
    subtitle_fr: '',
    subtitle_ar: '',
    subtitle_en: '',
    description_fr: '',
    description_ar: '',
    description_en: '',
    badge_fr: 'Exclusif',
    badge_ar: 'حصري',
    badge_en: 'Exclusive',
    features_fr: '',
    features_ar: '',
    features_en: '',
  });

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/services', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.services)) {
          setServices(data.services);
        }
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      id: `srv-${Date.now().toString().slice(-4)}`,
      slug: `service-${Date.now().toString().slice(-4)}`,
      iconName: 'Sparkles',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      priceStartingFrom: '500 AED',
      ctaLink: '/quote',
      active: true,
      order: services.length + 1,
      title_fr: 'Nouveau Service Exclusif',
      title_ar: 'خدمة سياحية جديدة',
      title_en: 'New Exclusive Service',
      subtitle_fr: 'Expérience d’exception personnalisée à Dubaï.',
      subtitle_ar: 'تجربة سياحية راقية واستثنائية في دبي.',
      subtitle_en: 'Exceptional personalized luxury experience in Dubai.',
      description_fr: 'Accompagnement complet par notre équipe d’experts pour un séjour inoubliable.',
      description_ar: 'مرافقة شاملة وخدمة استثنائية من فريقنا المتخصص لرحلة لا تُنسى.',
      description_en: 'Full VIP assistance by our dedicated team for an unforgettable stay in Dubai.',
      badge_fr: 'Nouveau',
      badge_ar: 'جديد',
      badge_en: 'New',
      features_fr: "Prestation haut de gamme garantie\nAssistance 24/7 dédiée\nRéservation flexible sans contrainte",
      features_ar: "خدمة راقية مضمونة 100%\nدعم متواصل على مدار 24/7\nمرونة كاملة في المواعيد والحجز",
      features_en: "Guaranteed premium luxury\nDedicated 24/7 concierge\nFlexible booking conditions",
    });
    setActiveTab('fr');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: TourismServiceItem) => {
    setEditingService(srv);
    setForm({
      id: srv.id,
      slug: srv.slug,
      iconName: srv.iconName || 'Sparkles',
      image: srv.image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      priceStartingFrom: srv.priceStartingFrom || '',
      ctaLink: srv.ctaLink || '/quote',
      active: srv.active,
      order: srv.order || 1,
      title_fr: srv.title?.fr || '',
      title_ar: srv.title?.ar || '',
      title_en: srv.title?.en || '',
      subtitle_fr: srv.subtitle?.fr || '',
      subtitle_ar: srv.subtitle?.ar || '',
      subtitle_en: srv.subtitle?.en || '',
      description_fr: srv.description?.fr || '',
      description_ar: srv.description?.ar || '',
      description_en: srv.description?.en || '',
      badge_fr: srv.badge?.fr || '',
      badge_ar: srv.badge?.ar || '',
      badge_en: srv.badge?.en || '',
      features_fr: Array.isArray(srv.features?.fr) ? srv.features.fr.join('\n') : '',
      features_ar: Array.isArray(srv.features?.ar) ? srv.features.ar.join('\n') : '',
      features_en: Array.isArray(srv.features?.en) ? srv.features.en.join('\n') : '',
    });
    setActiveTab('fr');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (srv: TourismServiceItem) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: srv.id, active: !srv.active }),
      });
      if (res.ok) {
        showNotif(`Service ${!srv.active ? 'activé' : 'masqué'} avec succès !`);
        fetchServices();
      }
    } catch (e) {
      showNotif('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement le service "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotif('Service supprimé avec succès.');
        fetchServices();
      }
    } catch (e) {
      showNotif('Erreur lors de la suppression');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<TourismServiceItem> = {
      id: form.id,
      slug: form.slug,
      iconName: form.iconName,
      image: form.image,
      priceStartingFrom: form.priceStartingFrom,
      ctaLink: form.ctaLink,
      active: form.active,
      order: Number(form.order) || 1,
      title: {
        fr: form.title_fr,
        ar: form.title_ar || form.title_fr,
        en: form.title_en || form.title_fr,
      },
      subtitle: {
        fr: form.subtitle_fr,
        ar: form.subtitle_ar || form.subtitle_fr,
        en: form.subtitle_en || form.subtitle_fr,
      },
      description: {
        fr: form.description_fr,
        ar: form.description_ar || form.description_fr,
        en: form.description_en || form.description_fr,
      },
      badge: {
        fr: form.badge_fr,
        ar: form.badge_ar || form.badge_fr,
        en: form.badge_en || form.badge_fr,
      },
      features: {
        fr: form.features_fr.split('\n').map((s) => s.trim()).filter(Boolean),
        ar: form.features_ar.split('\n').map((s) => s.trim()).filter(Boolean),
        en: form.features_en.split('\n').map((s) => s.trim()).filter(Boolean),
      },
    };

    try {
      const method = editingService ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotif(editingService ? 'Service mis à jour en direct !' : 'Nouveau service créé avec succès !');
        setIsModalOpen(false);
        fetchServices();
      } else {
        const d = await res.json();
        alert(d.error || 'Erreur lors de la sauvegarde');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  };

  const getIconComponent = (name: string) => {
    const found = ICON_OPTIONS.find((opt) => opt.id === name);
    return found ? found.icon : Sparkles;
  };

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.title?.fr || '').toLowerCase().includes(q) ||
      (s.title?.ar || '').toLowerCase().includes(q) ||
      (s.subtitle?.fr || '').toLowerCase().includes(q) ||
      (s.slug || '').toLowerCase().includes(q)
    );
  });

  const activeCount = services.filter((s) => s.active).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900 text-white p-6 sm:p-8 rounded-2xl border border-navy-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gold-500/20 text-gold-400 rounded-xl border border-gold-500/30">
              <Sparkles size={26} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestion des Services Touristiques</h1>
          </div>
          <p className="text-cream-100/70 text-sm max-w-2xl">
            Centre de contrôle de l&apos;ensemble des prestations AYMEN DUBAI TOURISME (Visas, Billetterie, Hôtels, Voitures, Immobilier, Safari, Yachts, Conciergerie VIP). Visible en direct sur <Link href="/services" target="_blank" className="text-gold-400 underline underline-offset-2">/services</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="p-3 bg-navy-800 text-cream-100 hover:text-gold-400 rounded-xl border border-navy-700 hover:bg-navy-700 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-gold-400' : ''} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-xl transition-all shadow-lg shadow-gold-500/20 hover:scale-[1.02]"
          >
            <Plus size={18} />
            <span>Ajouter un Service</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in border border-emerald-400">
          <Check size={20} className="text-white" />
          <span className="font-semibold text-sm">{notification}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Services Totaux</p>
          <p className="text-3xl font-extrabold text-navy-900">{services.length}</p>
          <p className="text-xs text-navy-600 mt-1">Catalogue officiel</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Services Actifs</p>
          <p className="text-3xl font-extrabold text-emerald-600">{activeCount}</p>
          <p className="text-xs text-navy-600 mt-1">Publiés sur le site</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Traduction 100%</p>
          <p className="text-3xl font-extrabold text-gold-600">FR • AR • EN</p>
          <p className="text-xs text-navy-600 mt-1">Support RTL natif</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Mises à Jour</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-emerald-700">Immédiates</span>
          </div>
          <p className="text-xs text-navy-600 mt-1">Zéro redémarrage</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un service par titre ou mot-clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-200 focus:outline-hidden focus:ring-2 focus:ring-gold-500 text-sm text-navy-900 bg-cream-50/50"
          />
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw size={32} className="animate-spin text-gold-500 mx-auto mb-3" />
          <p className="text-navy-600 font-medium">Chargement des services touristiques...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-cream-300">
          <Sparkles size={40} className="text-navy-300 mx-auto mb-3" />
          <p className="text-navy-900 font-bold text-lg mb-1">Aucun service trouvé</p>
          <p className="text-navy-600 text-sm mb-5">Ajoutez un nouveau service ou réinitialisez votre recherche.</p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-xl text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} /> Ajouter un service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = getIconComponent(service.iconName);

            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden group ${
                  service.active ? 'border-cream-200' : 'border-red-200 opacity-75 bg-slate-50'
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-navy-950">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.title?.fr || 'Service'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-navy-900 text-gold-400">
                      <Icon size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-black/20" />

                  {/* Icon badge */}
                  <div className="absolute top-3 left-3 p-2.5 rounded-xl bg-navy-900/90 text-gold-400 border border-gold-500/40 backdrop-blur-xs shadow-md">
                    <Icon size={20} />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {service.badge?.fr && (
                      <span className="px-2.5 py-1 bg-gold-500 text-navy-900 text-[11px] font-black rounded-md shadow-md uppercase">
                        {service.badge.fr}
                      </span>
                    )}
                    {!service.active && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md">
                        Masqué
                      </span>
                    )}
                  </div>

                  {/* Title banner */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-black text-lg drop-shadow-md line-clamp-1">
                      {service.title?.fr}
                    </h3>
                    {service.title?.ar && (
                      <p className="text-xs text-gold-300 font-bold font-arabic" dir="rtl">
                        {service.title.ar}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {service.priceStartingFrom && (
                      <div className="mb-2">
                        <span className="text-[11px] text-navy-700 font-bold uppercase">À partir de : </span>
                        <span className="text-base font-black text-gold-600">{service.priceStartingFrom}</span>
                      </div>
                    )}

                    <p className="text-xs text-navy-700 mb-4 line-clamp-2 leading-relaxed">
                      {service.subtitle?.fr || service.description?.fr}
                    </p>

                    {/* Features list */}
                    {service.features?.fr && service.features.fr.length > 0 && (
                      <div className="space-y-1.5 mb-4">
                        {service.features.fr.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-navy-800">
                            <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-cream-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        service.active 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      {service.active ? '✓ Actif' : '✗ Masqué'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {service.ctaLink && (
                        <Link
                          href={service.ctaLink}
                          target="_blank"
                          className="p-2 text-navy-600 hover:text-navy-900 hover:bg-cream-100 rounded-lg transition-colors"
                          title="Voir la page de ce service"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Edit2 size={13} />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.title?.fr || service.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-cream-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-gold-400" size={22} />
                <h3 className="text-lg font-bold">
                  {editingService ? `Modifier le Service : ${form.title_fr}` : 'Ajouter un Nouveau Service'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-cream-200 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Language Tabs & Auto-translate */}
            <div className="px-6 py-3 bg-cream-50 border-b border-cream-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy-700 uppercase tracking-wider mr-1">Langue :</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('fr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'fr' ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 hover:bg-cream-200'
                  }`}
                >
                  🇫🇷 Français
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'ar' ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 hover:bg-cream-200'
                  }`}
                >
                  🇦🇪 العربية (RTL)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'en' ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 hover:bg-cream-200'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>

              <AutoTranslateButton
                sourceText={form.title_fr ? `${form.title_fr}\n---\n${form.subtitle_fr}\n---\n${form.badge_fr}` : ''}
                showLanguageMenu={true}
                onTranslated={(text, target) => {
                  const parts = text.split('---').map((s) => s.trim());
                  if (target === 'ar') {
                    setForm((prev) => ({
                      ...prev,
                      title_ar: parts[0] || prev.title_ar,
                      subtitle_ar: parts[1] || prev.subtitle_ar,
                      badge_ar: parts[2] || prev.badge_ar,
                    }));
                  } else if (target === 'en') {
                    setForm((prev) => ({
                      ...prev,
                      title_en: parts[0] || prev.title_en,
                      subtitle_en: parts[1] || prev.subtitle_en,
                      badge_en: parts[2] || prev.badge_en,
                    }));
                  }
                  showNotif('Titres et sous-titres traduits automatiquement !');
                }}
              />
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Icône du Service</label>
                  <select
                    value={form.iconName}
                    onChange={(e) => setForm({ ...form, iconName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-medium bg-white"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Tarif à partir de (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="ex. 350 AED / jour"
                    value={form.priceStartingFrom}
                    onChange={(e) => setForm({ ...form, priceStartingFrom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-bold text-gold-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Lien de redirection (CTA)</label>
                  <input
                    type="text"
                    placeholder="ex. /visa, /flights, /quote"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Multilingual Content */}
              {activeTab === 'fr' && (
                <div className="space-y-4 p-4 bg-cream-50/70 rounded-xl border border-cream-200">
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Nom du Service (FR) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex. Safari Désert VIP & Soirée Bédouine"
                      value={form.title_fr}
                      onChange={(e) => setForm({ ...form, title_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Sous-titre / Résumé (FR)</label>
                    <input
                      type="text"
                      placeholder="ex. Excursions en 4x4, dîner bédouin, quads et spectacles sous les étoiles."
                      value={form.subtitle_fr}
                      onChange={(e) => setForm({ ...form, subtitle_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Badge mis en avant (FR)</label>
                    <input
                      type="text"
                      placeholder="ex. Incontournable, Populaire, VIP..."
                      value={form.badge_fr}
                      onChange={(e) => setForm({ ...form, badge_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Avantages & Inclusions (1 par ligne)</label>
                    <textarea
                      rows={3}
                      value={form.features_fr}
                      onChange={(e) => setForm({ ...form, features_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'ar' && (
                <div className="space-y-4 p-4 bg-cream-50/70 rounded-xl border border-cream-200" dir="rtl">
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">اسم الخدمة (عربي) *</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: سفاري الصحراء الفاخر"
                      value={form.title_ar}
                      onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-semibold bg-white font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">الملخص المختصر (عربي)</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: رحلات في الكثبان الرملية، عشاء بدوي فاخر وتجربة عربية ساحرة."
                      value={form.subtitle_ar}
                      onChange={(e) => setForm({ ...form, subtitle_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">شارة التميز (عربي)</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: تجربة لا تفوت، الأكثر طلباً..."
                      value={form.badge_ar}
                      onChange={(e) => setForm({ ...form, badge_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">المميزات الرئيسية (سطر لكل ميزة)</label>
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={form.features_ar}
                      onChange={(e) => setForm({ ...form, features_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-arabic"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'en' && (
                <div className="space-y-4 p-4 bg-cream-50/70 rounded-xl border border-cream-200">
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Service Title (EN) *</label>
                    <input
                      type="text"
                      placeholder="e.g. Desert Safari & VIP Bedouin Night"
                      value={form.title_en}
                      onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Subtitle / Summary (EN)</label>
                    <input
                      type="text"
                      placeholder="e.g. 4x4 dune bashing, VIP dinner, quad biking, and Arabian entertainment."
                      value={form.subtitle_en}
                      onChange={(e) => setForm({ ...form, subtitle_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Badge (EN)</label>
                    <input
                      type="text"
                      placeholder="e.g. Must Experience, Popular, VIP..."
                      value={form.badge_en}
                      onChange={(e) => setForm({ ...form, badge_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Key Perks (1 per line)</label>
                    <textarea
                      rows={3}
                      value={form.features_en}
                      onChange={(e) => setForm({ ...form, features_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Image and Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Photo / Image du Service</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMediaOpen(true)}
                      className="px-3 py-2 bg-navy-800 hover:bg-navy-700 text-gold-400 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      <FolderOpen size={14} />
                      <span>Médiathèque</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Ordre d&apos;affichage</label>
                  <input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="srvActiveCheck"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded-sm border-cream-300 focus:ring-gold-500"
                />
                <label htmlFor="srvActiveCheck" className="text-sm font-bold text-navy-900 cursor-pointer">
                  Afficher ce service sur le site public
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-cream-300 text-navy-700 hover:bg-cream-100 font-bold text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Check size={16} />
                  <span>Enregistrer et Publier le Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {isMediaOpen && (
        <MediaLibraryModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={(url) => {
            setForm((prev) => ({ ...prev, image: url }));
            setIsMediaOpen(false);
          }}
        />
      )}
    </div>
  );
}
