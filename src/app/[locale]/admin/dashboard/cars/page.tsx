'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Car, 
  Upload, 
  Check, 
  X, 
  Search, 
  Eye, 
  Sparkles, 
  Gauge, 
  Users, 
  ShieldCheck,
  Fuel,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import AutoTranslateButton from '@/components/admin/AutoTranslateButton';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';

interface CarItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePerDay: string;
  pricePerWeek?: string;
  pricePerMonth?: string;
  image: string;
  images?: string[];
  transmission: string;
  seats: number;
  engine: string;
  features: string[];
  status: string;
  featured?: boolean;
}

const CATEGORIES = [
  'Supercars & Sportives',
  'Luxe & Prestige',
  'SUV de Luxe',
  'SUV Familial',
  'Berlines & Économiques',
];

export default function DashboardCarsPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: 'Supercars & Sportives',
    pricePerDay: '',
    pricePerWeek: '',
    pricePerMonth: '',
    image: '',
    images: [] as string[],
    transmission: 'Automatique',
    seats: 5,
    engine: 'V8 Bi-Turbo',
    features: 'Assurance tous risques incluse, Livraison aéroport VIP, 250 km / jour inclus',
    status: 'Disponible',
    featured: false,
  });

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/cars', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.cars)) {
          setCars(data.cars);
        }
      }
    } catch (err) {
      console.error('Failed to load cars:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setForm({
      name: '',
      brand: '',
      category: 'Supercars & Sportives',
      pricePerDay: '2,500 AED',
      pricePerWeek: '15,000 AED',
      pricePerMonth: '50,000 AED',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'],
      transmission: 'Automatique',
      seats: 5,
      engine: 'V8 Biturbo',
      features: 'Assurance tous risques incluse, Livraison aéroport VIP, 250 km / jour inclus',
      status: 'Disponible',
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (car: CarItem) => {
    setEditingCar(car);
    const carImages = (car.images && car.images.length > 0) ? car.images : (car.image ? [car.image] : []);
    setForm({
      name: car.name,
      brand: car.brand,
      category: car.category,
      pricePerDay: car.pricePerDay,
      pricePerWeek: car.pricePerWeek || '',
      pricePerMonth: car.pricePerMonth || '',
      image: carImages[0] || car.image,
      images: carImages,
      transmission: car.transmission,
      seats: car.seats,
      engine: car.engine,
      features: Array.isArray(car.features) ? car.features.join(', ') : (car.features as any || ''),
      status: car.status,
      featured: Boolean(car.featured),
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages = [...form.images];
    
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          newImages.push(data.url);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    
    setForm((prev) => ({ 
      ...prev, 
      images: newImages,
      image: newImages.length > 0 ? newImages[0] : prev.image 
    }));
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showNotif('Photo(s) téléchargée(s) avec succès !');
  };

  const removeImage = (index: number) => {
    setForm(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : ''
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetId = editingCar ? editingCar.id : `CAR-${Date.now().toString().slice(-4)}`;
    const parsedFeatures = form.features
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedCar: CarItem = {
      id: targetId,
      name: form.name,
      brand: form.brand || form.name.split(' ')[0],
      category: form.category,
      pricePerDay: form.pricePerDay,
      pricePerWeek: form.pricePerWeek,
      pricePerMonth: form.pricePerMonth,
      image: form.images.length > 0 ? form.images[0] : (form.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'),
      images: form.images.length > 0 ? form.images : (form.image ? [form.image] : ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop']),
      transmission: form.transmission,
      seats: Number(form.seats) || 5,
      engine: form.engine,
      features: parsedFeatures,
      status: form.status,
      featured: form.featured,
    };

    // 1. Optimistic UI update
    setCars((prev) => {
      if (editingCar) {
        return prev.map((c) => (c.id === editingCar.id ? updatedCar : c));
      }
      return [updatedCar, ...prev];
    });

    setIsModalOpen(false);
    showNotif(editingCar ? 'Véhicule mis à jour en direct !' : 'Nouveau véhicule ajouté au catalogue !');

    // 2. Persist to API
    try {
      const method = editingCar ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/cars', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCar),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.car) {
          setCars((prev) => prev.map((c) => (c.id === targetId ? data.car : c)));
        }
      }
    } catch (err) {
      console.warn('API sync warning:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment retirer ce véhicule du parc automobile ?')) return;

    // Optimistic remove
    setCars((prev) => prev.filter((c) => c.id !== id));
    showNotif('Véhicule supprimé du catalogue.');

    try {
      await fetch(`/api/admin/cars?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  const handleToggleStatus = async (car: CarItem) => {
    const newStatus = car.status === 'Disponible' ? 'Loué' : 'Disponible';
    const updated = { ...car, status: newStatus };

    setCars((prev) => prev.map((c) => (c.id === car.id ? updated : c)));
    showNotif(`Statut mis à jour : ${newStatus}`);

    try {
      await fetch('/api/admin/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Status toggle error:', err);
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch = 
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Tous' || car.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      render: (row: CarItem) => (
        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
          <img
            src={row.image}
            alt={row.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop';
            }}
          />
          {row.featured && (
            <span className="absolute top-1 left-1 bg-gold-500 text-navy-900 text-[9px] font-extrabold px-1 rounded">
              TOP
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Modèle & Marque',
      render: (row: CarItem) => (
        <div>
          <p className="font-bold text-navy-900 text-sm">{row.name}</p>
          <span className="text-xs text-gold-600 font-semibold">{row.brand}</span>
          <span className="text-xs text-gray-400 mx-1.5">•</span>
          <span className="text-xs text-gray-500">{row.category}</span>
        </div>
      ),
    },
    {
      key: 'specs',
      label: 'Spécifications',
      render: (row: CarItem) => (
        <div className="text-xs text-navy-800 space-y-0.5">
          <p className="font-medium text-gray-700">{row.engine}</p>
          <p className="text-gray-500">{row.transmission} • {row.seats} places</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Tarifs (AED)',
      render: (row: CarItem) => (
        <div>
          <p className="font-bold text-gold-600 font-mono text-sm">{row.pricePerDay} <span className="text-xs text-gray-500 font-sans">/ jour</span></p>
          {row.pricePerWeek && (
            <p className="text-[11px] text-gray-500 font-mono">{row.pricePerWeek} / sem.</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (row: CarItem) => {
        const isAvail = row.status === 'Disponible';
        return (
          <button
            onClick={() => handleToggleStatus(row)}
            title="Cliquer pour changer de statut"
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              isAvail 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-green-600' : 'bg-amber-600'}`} />
            {isAvail ? 'DISPONIBLE' : 'LOUÉ'}
          </button>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: CarItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-navy-700 hover:text-gold-600 hover:bg-gold-50 rounded-md transition-colors"
            title="Modifier le véhicule"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            title="Supprimer le véhicule"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gold-500 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-gold-500 text-navy-900 p-1 rounded-full">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gold-500/10 text-gold-600 rounded-xl">
              <Car size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Parc Automobile & Voitures</h1>
              <p className="text-sm text-gray-500">
                Gérez vos véhicules en location, ajoutez des photos et mettez à jour les prix en direct.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCars}
            className="p-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-sm rounded-xl shadow-sm transition-all transform active:scale-95"
          >
            <Plus size={18} />
            <span>Ajouter une voiture</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Flotte</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{cars.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Véhicules enregistrés</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponibles</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {cars.filter((c) => c.status === 'Disponible').length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Prêts pour réservation</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supercars & Luxe</p>
          <p className="text-2xl font-bold text-gold-600 mt-1">
            {cars.filter((c) => c.category.includes('Supercar') || c.category.includes('Luxe')).length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Modèles prestige</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actuellement Loués</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {cars.filter((c) => c.status !== 'Disponible').length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">En cours d'utilisation</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, marque..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-gold-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-500 mr-1">Catégorie:</span>
          {['Tous', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                categoryFilter === cat
                  ? 'bg-navy-900 text-gold-400 font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cars DataTable */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredCars}
          isLoading={isLoading}
          emptyMessage="Aucun véhicule trouvé dans cette catégorie."
        />
      </div>

      {/* Modal Ajouter / Modifier Véhicule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-navy-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Car className="text-gold-500" size={22} />
                  {editingCar ? 'Modifier le véhicule' : 'Ajouter un nouveau véhicule'}
                </h3>
                <p className="text-xs text-cream-100/70 mt-1">
                  Les modifications sont immédiatement visibles sur la page publique des voitures (/cars).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
                  Photos du véhicule (Première = Cover)
                </label>
                
                <div className="flex flex-col gap-4">
                  {/* Gallery Preview */}
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-white text-red-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-gold-500 text-navy-900 text-[9px] font-bold text-center py-0.5">
                            COVER
                          </span>
                        )}
                      </div>
                    ))}
                    {form.images.length === 0 && (
                      <div className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        <Car size={24} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Upload Buttons */}
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Upload size={14} />
                        <span>{isUploading ? 'Envoi...' : 'Ajouter des photos'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMediaOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        <FolderOpen size={14} />
                        <span>Choisir dans la Médiathèque</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ou URL directe d'image"
                        id="new-image-url"
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-gold-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('new-image-url') as HTMLInputElement;
                          if (input.value) {
                            setForm(prev => ({
                              ...prev,
                              images: [...prev.images, input.value],
                              image: prev.images.length === 0 ? input.value : prev.image
                            }));
                            input.value = '';
                          }
                        }}
                        className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-navy-900 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Ajouter URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nom du véhicule & Modèle *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Lamborghini Urus S 2024"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Marque *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Lamborghini, Ferrari, Rolls-Royce..."
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Catégorie de véhicule *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tarif par Jour (AED) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 3,500 AED"
                    value={form.pricePerDay}
                    onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tarif par Semaine (AED) (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 22,000 AED"
                    value={form.pricePerWeek}
                    onChange={(e) => setForm({ ...form, pricePerWeek: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tarif par Mois (AED) (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 80,000 AED"
                    value={form.pricePerMonth}
                    onChange={(e) => setForm({ ...form, pricePerMonth: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Moteur & Puissance
                    </label>
                    <AutoTranslateButton
                      sourceText={form.engine}
                      showLanguageMenu={true}
                      size="xs"
                      label="Traduire"
                      onTranslated={(text) => setForm((prev) => ({ ...prev, engine: text }))}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="ex: V8 Bi-Turbo 650 ch"
                    value={form.engine}
                    onChange={(e) => setForm({ ...form, engine: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nombre de places
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={form.seats}
                    onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Transmission
                  </label>
                  <select
                    value={form.transmission}
                    onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  >
                    <option value="Automatique">Automatique</option>
                    <option value="Séquentielle">Séquentielle</option>
                    <option value="Manuelle">Manuelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Statut de disponibilité
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                  >
                    <option value="Disponible">Disponible (Prêt à louer)</option>
                    <option value="Loué">Loué (Actuellement réservé)</option>
                  </select>
                </div>
              </div>

              {/* Inclusions / Features */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Inclusions & Avantages (séparés par des virgules)
                  </label>
                  <AutoTranslateButton
                    sourceText={form.features}
                    showLanguageMenu={true}
                    size="xs"
                    label="Traduire les options"
                    onTranslated={(text) => setForm((prev) => ({ ...prev, features: text }))}
                  />
                </div>
                <input
                  type="text"
                  placeholder="ex: Assurance tous risques, 250 km / jour, Livraison aéroport"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-hidden"
                />
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
                />
                <label htmlFor="featured" className="text-xs font-medium text-gray-700">
                  Mettre en avant sur la page d'accueil et le haut de la liste (En vedette ⭐)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 rounded-xl text-sm font-bold shadow-md transition-colors"
                >
                  {editingCar ? 'Enregistrer les modifications' : 'Publier le véhicule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(url) => {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, url],
            image: prev.images.length === 0 ? url : prev.image,
          }));
          showNotif('Photo ajoutée depuis la Médiathèque !');
        }}
      />
    </div>
  );
}
