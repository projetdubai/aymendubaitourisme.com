'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Plane, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Clock, 
  Luggage, 
  ShieldCheck, 
  Sparkles, 
  FolderOpen,
  Eye,
  RefreshCw,
  ArrowRight,
  Send
} from 'lucide-react';
import { FlightItem } from '@/lib/flights';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';
import AutoTranslateButton from '@/components/admin/AutoTranslateButton';

const CABIN_FILTERS = [
  { id: 'all', label: 'Toutes les classes' },
  { id: 'economy', label: 'Classe Économique' },
  { id: 'business', label: 'Business & Affaires' },
  { id: 'vip', label: 'VIP & Première' },
];

export default function DashboardFlightsPage() {
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cabinFilter, setCabinFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'fr' | 'ar' | 'en'>('fr');
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    id: '',
    airline: 'Emirates (A380)',
    flightNumber: 'EK 074',
    cabinClass: 'economy' as 'economy' | 'premium' | 'business' | 'first',
    flightType: 'direct' as 'direct' | 'escales' | 'vip',
    priceStartingFrom: '1,850 AED',
    baggageAllowance: '2 x 23 kg inclus',
    duration: '6h 40m',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    active: true,
    order: 1,
    fromCity_fr: '',
    fromCity_ar: '',
    fromCity_en: '',
    toCity_fr: 'Dubaï DXB',
    toCity_ar: 'دبي (DXB)',
    toCity_en: 'Dubai DXB',
    badge_fr: 'Vol Direct Quotidien',
    badge_ar: 'رحلة مباشرة يومية',
    badge_en: 'Daily Direct Flight',
    features_fr: '',
    features_ar: '',
    features_en: '',
  });

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/flights', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.flights)) {
          setFlights(data.flights);
        }
      }
    } catch (err) {
      console.error('Failed to load flights:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const handleOpenAdd = () => {
    setEditingFlight(null);
    setForm({
      id: `fl-${Date.now().toString().slice(-4)}`,
      airline: 'Emirates',
      flightNumber: '',
      cabinClass: 'economy',
      flightType: 'direct',
      priceStartingFrom: '1,750 AED',
      baggageAllowance: '2 x 23 kg inclus',
      duration: '6h 30m Direct',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
      active: true,
      order: flights.length + 1,
      fromCity_fr: 'Paris CDG',
      fromCity_ar: 'باريس (CDG)',
      fromCity_en: 'Paris CDG',
      toCity_fr: 'Dubaï DXB',
      toCity_ar: 'دبي (DXB)',
      toCity_en: 'Dubai DXB',
      badge_fr: 'Vol Direct',
      badge_ar: 'رحلة مباشرة',
      badge_en: 'Direct Flight',
      features_fr: "Vol direct sans escale\n2 bagages de 23 kg inclus\nRepas chaud gastronomique\nDivertissement à bord inclus",
      features_ar: "رحلة مباشرة بدون توقف\nأمتعة 46 كجم مشمولة\nوجبات فاخرة طازجة\nنظام ترفيه جوي متكامل",
      features_en: "Non-stop direct flight\n2x 23kg baggage included\nGourmet meal service\nIn-flight entertainment",
    });
    setActiveTab('fr');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fl: FlightItem) => {
    setEditingFlight(fl);
    setForm({
      id: fl.id,
      airline: fl.airline,
      flightNumber: fl.flightNumber || '',
      cabinClass: fl.cabinClass,
      flightType: fl.flightType,
      priceStartingFrom: fl.priceStartingFrom,
      baggageAllowance: fl.baggageAllowance,
      duration: fl.duration,
      image: fl.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
      active: fl.active,
      order: fl.order || 1,
      fromCity_fr: fl.fromCity?.fr || '',
      fromCity_ar: fl.fromCity?.ar || '',
      fromCity_en: fl.fromCity?.en || '',
      toCity_fr: fl.toCity?.fr || 'Dubaï DXB',
      toCity_ar: fl.toCity?.ar || 'دبي (DXB)',
      toCity_en: fl.toCity?.en || 'Dubai DXB',
      badge_fr: fl.badge?.fr || '',
      badge_ar: fl.badge?.ar || '',
      badge_en: fl.badge?.en || '',
      features_fr: Array.isArray(fl.features?.fr) ? fl.features.fr.join('\n') : '',
      features_ar: Array.isArray(fl.features?.ar) ? fl.features.ar.join('\n') : '',
      features_en: Array.isArray(fl.features?.en) ? fl.features.en.join('\n') : '',
    });
    setActiveTab('fr');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (fl: FlightItem) => {
    try {
      const res = await fetch('/api/admin/flights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fl.id, active: !fl.active }),
      });
      if (res.ok) {
        showNotif(`Vol ${!fl.active ? 'activé' : 'masqué'} avec succès !`);
        fetchFlights();
      }
    } catch (e) {
      showNotif('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer l'offre de vol "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/flights?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotif('Offre de vol supprimée.');
        fetchFlights();
      }
    } catch (e) {
      showNotif('Erreur lors de la suppression');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<FlightItem> = {
      id: form.id,
      airline: form.airline,
      flightNumber: form.flightNumber,
      cabinClass: form.cabinClass,
      flightType: form.flightType,
      priceStartingFrom: form.priceStartingFrom,
      baggageAllowance: form.baggageAllowance,
      duration: form.duration,
      image: form.image,
      active: form.active,
      order: Number(form.order) || 1,
      fromCity: {
        fr: form.fromCity_fr,
        ar: form.fromCity_ar || form.fromCity_fr,
        en: form.fromCity_en || form.fromCity_fr,
      },
      toCity: {
        fr: form.toCity_fr,
        ar: form.toCity_ar || form.toCity_fr,
        en: form.toCity_en || form.toCity_fr,
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
      const method = editingFlight ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/flights', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotif(editingFlight ? 'Offre de vol mise à jour en direct !' : 'Nouvelle offre de vol enregistrée !');
        setIsModalOpen(false);
        fetchFlights();
      } else {
        const d = await res.json();
        alert(d.error || 'Erreur lors de la sauvegarde');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  };

  const filteredFlights = flights.filter((f) => {
    const matchesSearch = 
      (f.airline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.fromCity?.fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.toCity?.fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.priceStartingFrom || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCabin = 
      cabinFilter === 'all' || 
      (cabinFilter === 'vip' ? (f.cabinClass === 'business' || f.cabinClass === 'first' || f.flightType === 'vip') : f.cabinClass === cabinFilter);

    return matchesSearch && matchesCabin;
  });

  const directCount = flights.filter((f) => f.flightType === 'direct').length;
  const businessCount = flights.filter((f) => f.cabinClass === 'business' || f.cabinClass === 'first').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900 text-white p-6 sm:p-8 rounded-2xl border border-navy-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gold-500/20 text-gold-400 rounded-xl border border-gold-500/30">
              <Plane size={26} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billetterie & Offres de Vols</h1>
          </div>
          <p className="text-cream-100/70 text-sm max-w-2xl">
            Gérez vos offres de vols vers Dubaï, liaisons régulières (Paris, Alger, Casablanca, Tunis...), classes Business et Économique. Visible en direct sur <Link href="/flights" target="_blank" className="text-gold-400 underline underline-offset-2">/flights</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFlights}
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
            <span>Ajouter une Ligne / Vol</span>
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
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Total Lignes</p>
          <p className="text-3xl font-extrabold text-navy-900">{flights.length}</p>
          <p className="text-xs text-navy-600 mt-1">Offres enregistrées</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Vols Directs</p>
          <p className="text-3xl font-extrabold text-emerald-600">{directCount}</p>
          <p className="text-xs text-navy-600 mt-1">Sans escale vers Dubaï</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Business & VIP</p>
          <p className="text-3xl font-extrabold text-gold-600">{businessCount}</p>
          <p className="text-xs text-navy-600 mt-1">Salons & Fauteuil-lit</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Réservations Directes</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">WhatsApp & Devis</span>
          </div>
          <p className="text-xs text-navy-600 mt-1">Liaison 100% active</p>
        </div>
      </div>

      {/* Search & Cabin Class Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-cream-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher une compagnie, ville de départ, tarif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-200 focus:outline-hidden focus:ring-2 focus:ring-gold-500 text-sm text-navy-900 bg-cream-50/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {CABIN_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCabinFilter(filter.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                cabinFilter === filter.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-cream-100 text-navy-700 hover:bg-cream-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flights Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw size={32} className="animate-spin text-gold-500 mx-auto mb-3" />
          <p className="text-navy-600 font-medium">Chargement des offres de vols...</p>
        </div>
      ) : filteredFlights.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-cream-300">
          <Plane size={40} className="text-navy-300 mx-auto mb-3" />
          <p className="text-navy-900 font-bold text-lg mb-1">Aucun vol correspondant</p>
          <p className="text-navy-600 text-sm mb-5">Ajoutez une nouvelle liaison ou modifiez votre filtre.</p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-xl text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} /> Ajouter une offre de vol
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlights.map((flight) => (
            <div
              key={flight.id}
              className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden group ${
                flight.active ? 'border-cream-200' : 'border-red-200 opacity-75 bg-slate-50'
              }`}
            >
              {/* Card Header Image */}
              <div className="relative h-44 w-full overflow-hidden bg-navy-950">
                {flight.image ? (
                  <Image
                    src={flight.image}
                    alt={flight.airline}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-navy-900 text-gold-400">
                    <Plane size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-black/30" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-gold-500 text-navy-900 text-[11px] font-black rounded-md shadow-md uppercase">
                    {flight.badge?.fr || 'Vol Direct'}
                  </span>
                  {!flight.active && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md">
                      Masqué
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-black/60 text-cream-100 text-xs font-bold rounded-md backdrop-blur-xs">
                    {flight.cabinClass === 'business' ? 'Affaires / VIP' : flight.cabinClass === 'first' ? 'Première Classe' : 'Classe Éco'}
                  </span>
                </div>

                {/* Route banner */}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-bold text-gold-400 tracking-wider uppercase mb-0.5">
                    {flight.airline} {flight.flightNumber && `• ${flight.flightNumber}`}
                  </p>
                  <div className="flex items-center gap-2 text-white font-black text-lg">
                    <span>{flight.fromCity?.fr}</span>
                    <ArrowRight size={18} className="text-gold-400" />
                    <span>{flight.toCity?.fr}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Price and Baggage */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-cream-100">
                    <div>
                      <p className="text-[11px] text-navy-700 font-bold uppercase">À partir de</p>
                      <p className="text-xl font-extrabold text-gold-600">{flight.priceStartingFrom}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-navy-800 font-bold justify-end">
                        <Luggage size={14} className="text-gold-500" />
                        <span>{flight.baggageAllowance}</span>
                      </div>
                      <span className="text-[11px] text-navy-700">{flight.duration}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-1.5 mb-4">
                    {flight.features?.fr?.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-navy-800">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-cream-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(flight)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      flight.active 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    {flight.active ? '✓ En ligne' : '✗ Masqué'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/flights`}
                      target="_blank"
                      className="p-2 text-navy-600 hover:text-navy-900 hover:bg-cream-100 rounded-lg transition-colors"
                      title="Voir sur le site"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(flight)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Edit2 size={13} />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDelete(flight.id, `${flight.fromCity?.fr} - ${flight.toCity?.fr}`)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Flight */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-cream-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
              <div className="flex items-center gap-2.5">
                <Plane className="text-gold-400" size={22} />
                <h3 className="text-lg font-bold">
                  {editingFlight ? `Modifier le Vol : ${form.fromCity_fr} ✈ ${form.toCity_fr}` : 'Ajouter une Offre de Vol'}
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
                sourceText={`${form.fromCity_fr} / ${form.badge_fr}`}
                showLanguageMenu={true}
                onTranslated={(text, target) => {
                  const parts = text.split('/').map((s) => s.trim());
                  if (target === 'ar') {
                    setForm((prev) => ({
                      ...prev,
                      fromCity_ar: parts[0] || prev.fromCity_ar,
                      badge_ar: parts[1] || prev.badge_ar,
                    }));
                  } else if (target === 'en') {
                    setForm((prev) => ({
                      ...prev,
                      fromCity_en: parts[0] || prev.fromCity_en,
                      badge_en: parts[1] || prev.badge_en,
                    }));
                  }
                  showNotif('Villes et badges traduits automatiquement !');
                }}
              />
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Compagnie Aérienne</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Emirates (A380)"
                    value={form.airline}
                    onChange={(e) => setForm({ ...form, airline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Numéro de vol (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="ex. EK 074"
                    value={form.flightNumber}
                    onChange={(e) => setForm({ ...form, flightNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Classe de Cabine</label>
                  <select
                    value={form.cabinClass}
                    onChange={(e) => setForm({ ...form, cabinClass: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-medium bg-white"
                  >
                    <option value="economy">Classe Économique</option>
                    <option value="premium">Premium Économique</option>
                    <option value="business">Classe Affaires (Business)</option>
                    <option value="first">Première Classe (First Class)</option>
                  </select>
                </div>
              </div>

              {/* Price, Baggage, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Tarif à partir de</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. 1,850 AED"
                    value={form.priceStartingFrom}
                    onChange={(e) => setForm({ ...form, priceStartingFrom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-bold text-gold-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Franchise Bagages</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. 2 x 23 kg inclus"
                    value={form.baggageAllowance}
                    onChange={(e) => setForm({ ...form, baggageAllowance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Durée / Type</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. 6h 40m Direct"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Multilingual Route & Badge */}
              {activeTab === 'fr' && (
                <div className="space-y-4 p-4 bg-cream-50/70 rounded-xl border border-cream-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Ville de Départ (FR) *</label>
                      <input
                        type="text"
                        required
                        placeholder="ex. Paris CDG"
                        value={form.fromCity_fr}
                        onChange={(e) => setForm({ ...form, fromCity_fr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Ville d&apos;Arrivée (FR) *</label>
                      <input
                        type="text"
                        required
                        placeholder="ex. Dubaï DXB"
                        value={form.toCity_fr}
                        onChange={(e) => setForm({ ...form, toCity_fr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Badge (FR)</label>
                    <input
                      type="text"
                      placeholder="ex. Vol Direct Quotidien, Offre Spéciale..."
                      value={form.badge_fr}
                      onChange={(e) => setForm({ ...form, badge_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Prestations et Services inclus (1 par ligne)</label>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">مدينة المغادرة (عربي) *</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="مثال: باريس (CDG)"
                        value={form.fromCity_ar}
                        onChange={(e) => setForm({ ...form, fromCity_ar: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-arabic font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">مدينة الوصول (عربي) *</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="مثال: دبي (DXB)"
                        value={form.toCity_ar}
                        onChange={(e) => setForm({ ...form, toCity_ar: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-arabic font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">شارة العرض (عربي)</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: رحلة مباشرة يومية"
                      value={form.badge_ar}
                      onChange={(e) => setForm({ ...form, badge_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">الخدمات المشمولة (سطر لكل ميزة)</label>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Departure City (EN) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Paris CDG"
                        value={form.fromCity_en}
                        onChange={(e) => setForm({ ...form, fromCity_en: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy-800 mb-1">Arrival City (EN) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Dubai DXB"
                        value={form.toCity_en}
                        onChange={(e) => setForm({ ...form, toCity_en: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Badge (EN)</label>
                    <input
                      type="text"
                      placeholder="e.g. Daily Direct Flight"
                      value={form.badge_en}
                      onChange={(e) => setForm({ ...form, badge_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Included Perks (1 per line)</label>
                    <textarea
                      rows={3}
                      value={form.features_en}
                      onChange={(e) => setForm({ ...form, features_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Image and Active */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Photo / Bannière du Vol</label>
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

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="flightActiveCheck"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded-sm border-cream-300 focus:ring-gold-500"
                />
                <label htmlFor="flightActiveCheck" className="text-sm font-bold text-navy-900 cursor-pointer">
                  Afficher immédiatement cette liaison sur la page publique des vols
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
                  <span>Enregistrer l&apos;Offre de Vol</span>
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
