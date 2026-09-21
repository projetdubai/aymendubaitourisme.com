'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DataTable from '@/components/admin/DataTable';
import { Plus, Edit2, Trash2, Building2, RefreshCw, Check, Upload, FolderOpen, Image as ImageIcon } from 'lucide-react';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';

interface PropertyItem {
  id: string;
  title: string;
  location: string;
  type: string;
  category: string;
  price: string;
  image?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  status: string;
}

export default function DashboardPropertiesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    location: 'Downtown Dubai',
    type: 'Appartement',
    category: 'Vente',
    price: '',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,200 sqft',
    status: 'Active',
  });

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/properties', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          setProperties(data.properties);
        }
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
        showNotif('Photo du bien téléchargée avec succès !');
      } else {
        alert(data.error || 'Erreur lors du téléchargement');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Impossible de télécharger le fichier');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setForm({
      title: '',
      location: 'Downtown Dubai',
      type: 'Appartement',
      category: 'Vente',
      price: '',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
      bedrooms: 2,
      bathrooms: 2,
      area: '1,200 sqft',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prop: PropertyItem) => {
    setEditingProperty(prop);
    setForm({
      title: prop.title,
      location: prop.location,
      type: prop.type,
      category: prop.category,
      price: prop.price,
      image: prop.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
      bedrooms: prop.bedrooms || 1,
      bathrooms: prop.bathrooms || 1,
      area: prop.area || '1,000 sqft',
      status: prop.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetId = editingProperty ? editingProperty.id : `P-${Date.now().toString().slice(-4)}`;
    const updatedProperty: PropertyItem = {
      ...form,
      id: targetId,
    };

    // 1. Optimistic UI update: Immediate change on screen!
    setProperties((prev) => {
      if (editingProperty) {
        return prev.map((p) => (p.id === editingProperty.id ? updatedProperty : p));
      }
      return [updatedProperty, ...prev];
    });

    setIsModalOpen(false);
    showNotif(editingProperty ? 'Bien immobilier mis à jour avec succès !' : 'Nouveau bien ajouté avec succès !');

    // 2. Persist to API in background
    try {
      const method = editingProperty ? 'PUT' : 'POST';
      const body = { ...form, id: targetId };

      const res = await fetch('/api/admin/properties', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.property) {
          setProperties((prev) =>
            prev.map((p) => (p.id === targetId ? data.property : p))
          );
        }
      }
    } catch (err) {
      console.warn('Background sync failed, change kept in memory:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement ce bien immobilier ?')) return;

    // Optimistic removal
    setProperties((prev) => prev.filter((p) => p.id !== id));
    showNotif('Bien immobilier supprimé avec succès.');

    try {
      await fetch(`/api/admin/properties?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Delete sync error:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === 'Active';
    return (
      <span
        className={`px-2.5 py-1 text-xs font-bold rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
        }`}
      >
        {isActive ? 'DISPONIBLE' : 'ARCHIVÉ'}
      </span>
    );
  };

  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      render: (row: PropertyItem) => (
        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
          <img
            src={row.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop'}
            alt={row.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop';
            }}
          />
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Titre du bien',
      render: (row: PropertyItem) => (
        <div>
          <p className="font-bold text-navy-900">{row.title}</p>
          <p className="text-xs text-gray-500">{row.bedrooms} Ch. • {row.bathrooms} Sdb • {row.area}</p>
        </div>
      ),
    },
    { key: 'location', label: 'Localisation' },
    { key: 'type', label: 'Type' },
    {
      key: 'category',
      label: 'Transaction',
      render: (row: PropertyItem) => (
        <span className="font-semibold text-xs text-navy-900">
          {row.category}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Prix',
      render: (row: PropertyItem) => (
        <span className="font-bold text-gold-600 font-mono">{row.price}</span>
      ),
    },
    { key: 'status', label: 'Statut', render: (row: PropertyItem) => getStatusBadge(row.status) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: PropertyItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
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
        <div className="p-4 bg-green-600 text-white rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <Check size={20} />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <Building2 size={22} className="text-gold-500" />
            Gestion des Biens Immobiliers
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ajoutez, modifiez ou retirez des biens de la vitrine immobilière publique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProperties}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-sm rounded-lg shadow transition-colors"
          >
            <Plus size={16} />
            <span>Ajouter un bien</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl">
          <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable columns={columns} data={properties} emptyMessage="Aucun bien immobilier configuré." />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b pb-3">
              <h3 className="text-lg font-bold text-navy-900">
                {editingProperty ? 'Modifier le Bien' : 'Ajouter un Bien Immobilier'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Renseignez les détails du bien à afficher sur le site.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Photo du bien immobilier
                </label>
                <div className="flex gap-3 items-center">
                  <div className="relative w-24 h-18 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 shrink-0 flex items-center justify-center">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 size={24} className="text-gray-300" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                        Envoi...
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Upload size={14} />
                        <span>Télécharger une photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMediaOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        <FolderOpen size={14} />
                        <span>Médiathèque</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Ou collez un lien URL d'image"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-gold-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">Titre de l&apos;annonce</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Villa de Prestige Palm Jumeirah"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Localisation</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Downtown, Marina, Palm..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Prix (AED)</label>
                  <input
                    type="text"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Ex: 17,000,000 AED"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Type de bien</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="Appartement">Appartement</option>
                    <option value="Villa">Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Bureau">Bureau</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="Vente">Vente</option>
                    <option value="Location">Location</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Chambres</label>
                  <input
                    type="number"
                    min={0}
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Salles de bain</label>
                  <input
                    type="number"
                    min={1}
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Surface</label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="7,500 sqft"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 rounded-lg text-xs font-bold shadow"
                >
                  {editingProperty ? 'Mettre à jour' : 'Ajouter le bien'}
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
          setForm((prev) => ({ ...prev, image: url }));
          showNotif('Photo sélectionnée depuis la Médiathèque !');
        }}
      />
    </div>
  );
}
