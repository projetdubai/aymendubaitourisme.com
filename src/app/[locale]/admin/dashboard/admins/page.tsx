'use client';

import { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/admin/DataTable';
import { UserPlus, Trash2, ShieldCheck, RefreshCw, KeyRound, Check } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Administrateur',
  });

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdmins(data.admins || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotif('Nouvel administrateur ajouté avec succès !');
        setIsModalOpen(false);
        setForm({ name: '', email: '', password: '', role: 'Administrateur' });
        await fetchAdmins();
      } else {
        alert(data.message || 'Erreur lors de l\'ajout.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (!confirm(`Supprimer l'administrateur ${email} ?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotif('Administrateur supprimé avec succès.');
        await fetchAdmins();
      } else {
        alert(data.message || 'Impossible de supprimer.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nom de l\'administrateur',
      render: (row: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy-900 text-gold-400 font-bold text-xs flex items-center justify-center">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-navy-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle & Droits',
      render: (row: AdminUser) => (
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
          <ShieldCheck size={13} />
          {row.role}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Date d\'ajout' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: AdminUser) => (
        <button
          onClick={() => handleDeleteAdmin(row.id, row.email)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer cet administrateur"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="p-4 bg-green-600 text-white rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <Check size={20} />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <KeyRound size={22} className="text-gold-500" />
            Gestion des Comptes Administrateurs
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ajoutez de nouveaux gestionnaires pour administrer le site ou modifier les droits d&apos;accès.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdmins}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold text-sm rounded-lg shadow transition-colors"
          >
            <UserPlus size={16} />
            <span>Ajouter un administrateur</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl">
          <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable columns={columns} data={admins} emptyMessage="Aucun administrateur trouvé." />
      )}

      {/* Modal Add Admin */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b pb-3">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <UserPlus size={20} className="text-gold-500" />
                Créer un Compte Administrateur
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ce nouvel administrateur pourra se connecter et gérer le site en ligne.
              </p>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Nom Complet
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Mohamed Al-Amiri"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Adresse Email (Identifiant de connexion)
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@aymendubaitourisme.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Mot de passe provisoire
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Rôle & Permissions
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none bg-white"
                >
                  <option value="Administrateur">Administrateur (Gestion standard)</option>
                  <option value="Super Administrateur">Super Administrateur (Accès total)</option>
                  <option value="Modérateur Avis">Modérateur (Gestion des avis)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 rounded-lg text-xs font-bold shadow transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Créer l\'accès'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
