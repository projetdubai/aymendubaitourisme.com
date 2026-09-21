'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FileCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Sparkles, 
  FolderOpen,
  Eye,
  RefreshCw,
  Tag,
  FileText
} from 'lucide-react';
import { VisaItem } from '@/lib/visas';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';
import AutoTranslateButton from '@/components/admin/AutoTranslateButton';

const CATEGORIES = [
  { id: 'all', label: 'Toutes les catégories' },
  { id: 'dubai', label: 'Dubaï Tourisme' },
  { id: 'extension', label: 'Prolongation sur place' },
  { id: 'express', label: 'Express VIP' },
  { id: 'gcc', label: 'Pays du Golfe (GCC)' },
];

export default function DashboardVisasPage() {
  const [visas, setVisas] = useState<VisaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisa, setEditingVisa] = useState<VisaItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'fr' | 'ar' | 'en'>('fr');
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    id: '',
    slug: '',
    category: 'dubai' as 'dubai' | 'extension' | 'express' | 'gcc',
    duration: '30 Jours',
    price: '450 AED',
    processingTime: '24h - 48h',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    active: true,
    order: 1,
    title_fr: '',
    title_ar: '',
    title_en: '',
    subtitle_fr: '',
    subtitle_ar: '',
    subtitle_en: '',
    badge_fr: 'Populaire',
    badge_ar: 'الأكثر طلباً',
    badge_en: 'Most Popular',
    features_fr: '',
    features_ar: '',
    features_en: '',
    requirements_fr: '',
    requirements_ar: '',
    requirements_en: '',
  });

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchVisas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/visas', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.visas)) {
          setVisas(data.visas);
        }
      }
    } catch (err) {
      console.error('Failed to load visas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisas();
  }, [fetchVisas]);

  const handleOpenAdd = () => {
    setEditingVisa(null);
    setForm({
      id: `visa-${Date.now().toString().slice(-4)}`,
      slug: `visa-${Date.now().toString().slice(-4)}`,
      category: 'dubai',
      duration: '30 Jours',
      price: '450 AED',
      processingTime: '24h - 48h',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      active: true,
      order: visas.length + 1,
      title_fr: 'Visa Tourisme Dubaï',
      title_ar: 'تأشيرة سياحية لدبي',
      title_en: 'Dubai Tourist Visa',
      subtitle_fr: 'Délivrance rapide et officielle pour votre séjour à Dubaï.',
      subtitle_ar: 'إصدار سريع ورسمي لإقامتك في دبي.',
      subtitle_en: 'Fast and official tourist visa issuance for your Dubai trip.',
      badge_fr: 'Nouveau',
      badge_ar: 'جديد',
      badge_en: 'New',
      features_fr: "Validité d'entrée de 60 jours\nSéjour consécutif aux EAU\nAssurance voyage incluse\nAssistance 24/7",
      features_ar: "صلاحية دخول 60 يوماً\nإقامة مريحة في الإمارات\nشامل التأمين الصحي\nدعم متواصل على مدار الساعة",
      features_en: "60-day entry validity\nFlexible stay in UAE\nHealth insurance included\n24/7 dedicated support",
      requirements_fr: "Copie claire du passeport (6 mois min)\nPhoto d’identité fond blanc",
      requirements_ar: "صورة واضحة لجواز السفر\nصورة شخصية بخلفية بيضاء",
      requirements_en: "Clear passport copy (6 months min)\nPassport-size white background photo",
    });
    setActiveTab('fr');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (visa: VisaItem) => {
    setEditingVisa(visa);
    setForm({
      id: visa.id,
      slug: visa.slug,
      category: visa.category,
      duration: visa.duration,
      price: visa.price,
      processingTime: visa.processingTime,
      image: visa.image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
      active: visa.active,
      order: visa.order || 1,
      title_fr: visa.title?.fr || '',
      title_ar: visa.title?.ar || '',
      title_en: visa.title?.en || '',
      subtitle_fr: visa.subtitle?.fr || '',
      subtitle_ar: visa.subtitle?.ar || '',
      subtitle_en: visa.subtitle?.en || '',
      badge_fr: visa.badge?.fr || '',
      badge_ar: visa.badge?.ar || '',
      badge_en: visa.badge?.en || '',
      features_fr: Array.isArray(visa.features?.fr) ? visa.features.fr.join('\n') : '',
      features_ar: Array.isArray(visa.features?.ar) ? visa.features.ar.join('\n') : '',
      features_en: Array.isArray(visa.features?.en) ? visa.features.en.join('\n') : '',
      requirements_fr: Array.isArray(visa.requirements?.fr) ? visa.requirements.fr.join('\n') : '',
      requirements_ar: Array.isArray(visa.requirements?.ar) ? visa.requirements.ar.join('\n') : '',
      requirements_en: Array.isArray(visa.requirements?.en) ? visa.requirements.en.join('\n') : '',
    });
    setActiveTab('fr');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (visa: VisaItem) => {
    try {
      const res = await fetch('/api/admin/visas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: visa.id, active: !visa.active }),
      });
      if (res.ok) {
        showNotif(`Visa ${!visa.active ? 'activé' : 'masqué'} avec succès !`);
        fetchVisas();
      }
    } catch (e) {
      showNotif('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement l'offre de visa "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/visas?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotif(`Offre de visa supprimée.`);
        fetchVisas();
      }
    } catch (e) {
      showNotif('Erreur lors de la suppression');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<VisaItem> = {
      id: form.id,
      slug: form.slug,
      category: form.category,
      duration: form.duration,
      price: form.price,
      processingTime: form.processingTime,
      image: form.image,
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
      requirements: {
        fr: form.requirements_fr.split('\n').map((s) => s.trim()).filter(Boolean),
        ar: form.requirements_ar.split('\n').map((s) => s.trim()).filter(Boolean),
        en: form.requirements_en.split('\n').map((s) => s.trim()).filter(Boolean),
      },
    };

    try {
      const method = editingVisa ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/visas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotif(editingVisa ? 'Offre de visa mise à jour en direct !' : 'Nouvelle offre de visa créée avec succès !');
        setIsModalOpen(false);
        fetchVisas();
      } else {
        const d = await res.json();
        alert(d.error || 'Erreur lors de la sauvegarde');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  };

  const filteredVisas = visas.filter((v) => {
    const matchesSearch = 
      (v.title?.fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.title?.ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.price || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.duration || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeCount = visas.filter((v) => v.active).length;
  const expressCount = visas.filter((v) => v.category === 'express' || v.processingTime.toLowerCase().includes('express') || v.processingTime.includes('12h')).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900 text-white p-6 sm:p-8 rounded-2xl border border-navy-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gold-500/20 text-gold-400 rounded-xl border border-gold-500/30">
              <FileCheck size={26} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestion des Visas & Prolongations</h1>
          </div>
          <p className="text-cream-100/70 text-sm max-w-2xl">
            Gérez l&apos;ensemble des offres de visas touristiques Dubaï (30j, 60j, multiples), extensions sur place et visas GCC. Les modifications apparaissent en direct sur la page publique <Link href="/visa" target="_blank" className="text-gold-400 underline underline-offset-2">/visa</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVisas}
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
            <span>Ajouter une Offre de Visa</span>
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
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Total Offres</p>
          <p className="text-3xl font-extrabold text-navy-900">{visas.length}</p>
          <p className="text-xs text-navy-600 mt-1">Catalogue complet</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Visas Actifs</p>
          <p className="text-3xl font-extrabold text-emerald-600">{activeCount}</p>
          <p className="text-xs text-navy-600 mt-1">Visibles en ligne</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Offres Express</p>
          <p className="text-3xl font-extrabold text-amber-500">{expressCount}</p>
          <p className="text-xs text-navy-600 mt-1">Délai rapide &lt; 24h</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-cream-200/80 shadow-xs">
          <p className="text-xs font-bold text-navy-700 uppercase tracking-wider mb-1">Synchronisation</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-sm font-bold text-emerald-700">En Temps Réel</span>
          </div>
          <p className="text-xs text-navy-600 mt-1">Cloud DB Connectée</p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-cream-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par titre, durée, tarif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-200 focus:outline-hidden focus:ring-2 focus:ring-gold-500 text-sm text-navy-900 bg-cream-50/50"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-cream-100 text-navy-700 hover:bg-cream-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visas Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw size={32} className="animate-spin text-gold-500 mx-auto mb-3" />
          <p className="text-navy-600 font-medium">Chargement des offres de visas...</p>
        </div>
      ) : filteredVisas.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-cream-300">
          <FileCheck size={40} className="text-navy-300 mx-auto mb-3" />
          <p className="text-navy-900 font-bold text-lg mb-1">Aucune offre de visa trouvée</p>
          <p className="text-navy-600 text-sm mb-5">Essayez de modifier votre recherche ou ajoutez un nouveau forfait visa.</p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-xl text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} /> Ajouter une offre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisas.map((visa) => (
            <div
              key={visa.id}
              className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden group ${
                visa.active ? 'border-cream-200' : 'border-red-200 opacity-75 bg-slate-50'
              }`}
            >
              {/* Card top banner with image preview */}
              <div className="relative h-40 w-full overflow-hidden bg-navy-950">
                {visa.image ? (
                  <Image
                    src={visa.image}
                    alt={visa.title?.fr || 'Visa Dubaï'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-navy-900 text-gold-400">
                    <FileCheck size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/30" />

                {/* Badges on image */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-gold-500 text-navy-900 text-[11px] font-extrabold rounded-md shadow-md uppercase tracking-wider">
                    {visa.badge?.fr || 'Offre Spéciale'}
                  </span>
                  {!visa.active && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-md">
                      Masqué
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 bg-navy-900/90 text-gold-400 border border-gold-500/30 text-xs font-bold rounded-md">
                    {visa.duration}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-xl font-extrabold text-white drop-shadow-md">
                    {visa.price}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-cream-100 font-medium bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-xs">
                    <Clock size={13} className="text-gold-400" />
                    <span>{visa.processingTime}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-navy-900 mb-1 group-hover:text-gold-600 transition-colors">
                    {visa.title?.fr}
                  </h3>
                  {visa.title?.ar && (
                    <p className="text-xs font-bold text-navy-600 mb-2 font-arabic" dir="rtl">
                      {visa.title.ar}
                    </p>
                  )}
                  <p className="text-xs text-navy-600 mb-4 line-clamp-2">
                    {visa.subtitle?.fr || visa.subtitle?.en}
                  </p>

                  {/* Key Features */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[11px] font-bold text-navy-700 uppercase tracking-wider">Inclusions Clés :</p>
                    {visa.features?.fr?.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-navy-800">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Requirements badge pills */}
                  {visa.requirements?.fr && visa.requirements.fr.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {visa.requirements.fr.slice(0, 2).map((req, i) => (
                        <span key={i} className="px-2 py-0.5 bg-cream-100 text-navy-800 text-[10px] rounded-md border border-cream-200">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-cream-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(visa)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      visa.active 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    {visa.active ? '✓ Actif' : '✗ Masqué'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/visa`}
                      target="_blank"
                      className="p-2 text-navy-600 hover:text-navy-900 hover:bg-cream-100 rounded-lg transition-colors"
                      title="Voir sur le site public"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(visa)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Edit2 size={13} />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDelete(visa.id, visa.title?.fr || visa.id)}
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-cream-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between border-b border-navy-800">
              <div className="flex items-center gap-2.5">
                <FileCheck className="text-gold-400" size={22} />
                <h3 className="text-lg font-bold">
                  {editingVisa ? `Modifier le Visa : ${form.title_fr}` : 'Ajouter une Offre de Visa'}
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
                    activeTab === 'fr' ? 'bg-navy-900 text-white shadow-xs' : 'bg-white text-navy-700 hover:bg-cream-200'
                  }`}
                >
                  🇫🇷 Français
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'ar' ? 'bg-navy-900 text-white shadow-xs' : 'bg-white text-navy-700 hover:bg-cream-200'
                  }`}
                >
                  🇦🇪 العربية (RTL)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'en' ? 'bg-navy-900 text-white shadow-xs' : 'bg-white text-navy-700 hover:bg-cream-200'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>

              {/* Auto Translate Button */}
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
                  showNotif('Traduction automatique appliquée avec succès !');
                }}
              />
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Category, Duration, Price, Time Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-medium focus:ring-2 focus:ring-gold-500 bg-white"
                  >
                    <option value="dubai">Dubaï Tourisme</option>
                    <option value="extension">Prolongation sur place</option>
                    <option value="express">Express VIP</option>
                    <option value="gcc">Pays du Golfe (GCC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Durée</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. 30 Jours"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm focus:ring-2 focus:ring-gold-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Prix (AED / Devise)</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. 450 AED"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-bold text-gold-600 focus:ring-2 focus:ring-gold-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Délai Traitement</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. 24h - 48h"
                    value={form.processingTime}
                    onChange={(e) => setForm({ ...form, processingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm focus:ring-2 focus:ring-gold-500 bg-white"
                  />
                </div>
              </div>

              {/* Multilingual Fields */}
              {activeTab === 'fr' && (
                <div className="space-y-4 p-4 bg-cream-50/70 rounded-xl border border-cream-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1">
                    <span>🇫🇷 Contenu en Français</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Titre de l&apos;offre (FR) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex. Visa Tourisme 1 Mois (30 Jours)"
                      value={form.title_fr}
                      onChange={(e) => setForm({ ...form, title_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-semibold text-navy-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Sous-titre / Description courte (FR)</label>
                    <input
                      type="text"
                      placeholder="ex. Idéal pour les vacances et les séjours courts à Dubaï."
                      value={form.subtitle_fr}
                      onChange={(e) => setForm({ ...form, subtitle_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Badge mis en avant (FR)</label>
                    <input
                      type="text"
                      placeholder="ex. Le Plus Demandé, Meilleure Valeur, Sans Sortie..."
                      value={form.badge_fr}
                      onChange={(e) => setForm({ ...form, badge_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Avantages & Inclusions (1 par ligne)</label>
                    <textarea
                      rows={3}
                      placeholder="Validité d'entrée de 60 jours&#10;Durée de séjour de 30 jours&#10;Assurance santé voyage incluse"
                      value={form.features_fr}
                      onChange={(e) => setForm({ ...form, features_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Documents requis (1 par ligne)</label>
                    <textarea
                      rows={2}
                      placeholder="Copie claire du passeport (6 mois min)&#10;Photo d’identité sur fond blanc"
                      value={form.requirements_fr}
                      onChange={(e) => setForm({ ...form, requirements_fr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'ar' && (
                <div className="space-y-4 p-4 bg-cream-50/70 rounded-xl border border-cream-200" dir="rtl">
                  <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1 font-arabic">
                    <span>🇦🇪 المحتوى باللغة العربية (RTL)</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">عنوان العرض (عربي) *</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: تأشيرة سياحية شهر (30 يوماً)"
                      value={form.title_ar}
                      onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-semibold text-navy-900 bg-white font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">الوصف المختصر (عربي)</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: مثالية للإجازات القصيرة وزيارات العمل السريعة."
                      value={form.subtitle_ar}
                      onChange={(e) => setForm({ ...form, subtitle_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">شارة التميز (عربي)</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: الأكثر طلباً، قيمة ممتازة، بدون مغادرة..."
                      value={form.badge_ar}
                      onChange={(e) => setForm({ ...form, badge_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">المميزات والشروط (سطر لكل ميزة)</label>
                    <textarea
                      rows={3}
                      dir="rtl"
                      placeholder="صلاحية الدخول 60 يوماً&#10;مدة الإقامة 30 يوماً متواصلة&#10;شامل التأمين الصحي الإماراتي"
                      value={form.features_ar}
                      onChange={(e) => setForm({ ...form, features_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1 font-arabic">المستندات المطلوبة (سطر لكل مستند)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      placeholder="صورة واضحة لجواز السفر&#10;صورة شخصية بخلفية بيضاء"
                      value={form.requirements_ar}
                      onChange={(e) => setForm({ ...form, requirements_ar: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white font-arabic"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'en' && (
                <div className="space-y-4 p-4 bg-cream-50/70 rounded-xl border border-cream-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-navy-900 mb-1">
                    <span>🇬🇧 English Content</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Visa Title (EN) *</label>
                    <input
                      type="text"
                      placeholder="e.g. 30-Day Tourist Visa (1 Month)"
                      value={form.title_en}
                      onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm font-semibold text-navy-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Short Description (EN)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ideal for short vacations, family visits, or business trips."
                      value={form.subtitle_en}
                      onChange={(e) => setForm({ ...form, subtitle_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Badge (EN)</label>
                    <input
                      type="text"
                      placeholder="e.g. Most Popular, Best Value, No Exit Required..."
                      value={form.badge_en}
                      onChange={(e) => setForm({ ...form, badge_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Inclusions & Features (1 per line)</label>
                    <textarea
                      rows={3}
                      placeholder="60-day entry validity&#10;30 consecutive days stay in UAE&#10;Health insurance included"
                      value={form.features_en}
                      onChange={(e) => setForm({ ...form, features_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-800 mb-1">Required Documents (1 per line)</label>
                    <textarea
                      rows={2}
                      placeholder="Clear passport copy (valid 6+ months)&#10;Recent passport-size photo"
                      value={form.requirements_en}
                      onChange={(e) => setForm({ ...form, requirements_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm text-navy-800 bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Image & Settings Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy-800 mb-1.5">Image d&apos;illustration (URL ou Médiathèque)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
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

              {/* Active Toggle Checkbox */}
              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded-sm border-cream-300 focus:ring-gold-500"
                />
                <label htmlFor="activeCheck" className="text-sm font-bold text-navy-900 cursor-pointer">
                  Afficher immédiatement cette offre de visa sur le site public
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
                  <span>Enregistrer et Publier en Direct</span>
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
