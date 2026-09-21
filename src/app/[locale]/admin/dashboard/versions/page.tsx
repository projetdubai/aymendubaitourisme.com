'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  AlertTriangle, 
  Clock, 
  User, 
  Layers, 
  Calendar,
  Sparkles,
  RefreshCw,
  Check,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import DeployButton from '@/components/admin/DeployButton';
import { SiteVersion } from '@/lib/versions';

export default function VersionsAdminPage() {
  const [versions, setVersions] = useState<SiteVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newAuthor, setNewAuthor] = useState('Aymen Boulabeiz');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/versions');
      if (res.ok) {
        const data = await res.json();
        if (data.versions) {
          setVersions(data.versions);
        }
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
      showNotif('Impossible de charger l\'historique des versions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) {
      alert('Veuillez renseigner une description pour cette version.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: newNote.trim(),
          author: newAuthor.trim() || 'Aymen Boulabeiz'
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotif(`Nouvelle version ${data.version.version} enregistrée avec succès !`);
        setNewNote('');
        setShowCreateModal(false);
        await fetchVersions();
      } else {
        showNotif(data.message || 'Erreur lors de la création de version', 'error');
      }
    } catch {
      showNotif('Erreur réseau lors de la création', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRollback = async (version: SiteVersion) => {
    const confirmRollback = window.confirm(
      `Êtes-vous sûr de vouloir restaurer la version ${version.version} (${version.note}) ?\n\nLe contenu du site sera immédiatement rétabli à cet état.`
    );
    if (!confirmRollback) return;

    setRestoringId(version.id);
    try {
      const res = await fetch('/api/admin/versions/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: version.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotif(`Version ${version.version} restaurée avec succès ! Le site a été mis à jour.`);
        await fetchVersions();
      } else {
        showNotif(data.message || 'Erreur lors du rollback', 'error');
      }
    } catch {
      showNotif('Erreur réseau lors de la restauration', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  const activeVersion = versions.find((v) => v.isActive) || versions[0];
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl shadow-xl flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
          <span className="text-sm font-semibold">{notification.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gold-500/10 rounded-xl text-gold-600">
              <History size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
              Système de Versions & Restauration (Rollback)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Chaque modification majeure peut être sauvegardée en instantané. Restaurez n&apos;importe quelle version antérieure en un clic en cas d&apos;imprévu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchVersions()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus size={16} className="text-gold-400" />
            <span>Créer un Instantané / Version</span>
          </button>

          <DeployButton variant="header" />
        </div>
      </div>

      {/* Active Version Highlight Card */}
      {activeVersion && (
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white p-6 rounded-2xl border border-navy-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Version Actuellement en Ligne
                </span>
                <span className="text-xs text-cream-100/60 font-mono">
                  ID: {activeVersion.id}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-extrabold text-gold-400 font-mono">
                  {activeVersion.version}
                </h3>
                <span className="text-sm text-cream-100/80 font-medium">
                  — {activeVersion.note}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-5 mt-4 text-xs text-cream-100/60">
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-gold-400" />
                  <span>Auteur : <strong className="text-white">{activeVersion.author}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gold-400" />
                  <span>Date : {new Date(activeVersion.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                {activeVersion.snapshot?.sections && (
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-gold-400" />
                    <span>{activeVersion.snapshot.sections.filter((s: any) => s.enabled !== false).length} sections actives</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <div className="px-4 py-3 bg-navy-900/90 rounded-xl border border-gold-500/30 text-center">
                <div className="text-[11px] uppercase tracking-wider text-gold-400 font-bold">Sécurité Garantie</div>
                <div className="text-xs text-cream-100/70 mt-0.5">Sauvegardé et vérifié</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Table / List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-navy-900">Historique des Versions du Site</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {versions.length} point(s) de restauration enregistrés dans le système
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-3">
            <RefreshCw size={28} className="animate-spin text-gold-500" />
            <p className="text-sm font-medium">Chargement de l&apos;historique...</p>
          </div>
        ) : sortedVersions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Clock size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune version enregistrée pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedVersions.map((v) => {
              const isActive = v.isActive;
              const isRestoring = restoringId === v.id;
              const dateFormatted = new Date(v.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={v.id}
                  className={`p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isActive ? 'bg-amber-50/40' : 'hover:bg-gray-50/80'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-navy-900 text-base">
                        {v.version}
                      </span>
                      {isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active en Ligne
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                          Archivée
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {dateFormatted}
                      </span>
                    </div>

                    <p className="text-sm text-gray-800 font-medium">
                      {v.note}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Auteur : <strong>{v.author}</strong></span>
                      {v.snapshot?.sections && (
                        <span>• {v.snapshot.sections.length} sections enregistrées</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isActive ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <Check size={14} className="stroke-[3]" />
                        <span>En service</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRollback(v)}
                        disabled={isRestoring}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-red-500 font-bold text-xs transition-all disabled:opacity-50 shadow-sm"
                        title="Restaurer immédiatement le site à cette version antérieure"
                      >
                        <RotateCcw size={14} className={isRestoring ? 'animate-spin' : ''} />
                        <span>{isRestoring ? 'Restauration...' : 'Restaurer cette version'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Snapshot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden">
            <div className="p-5 bg-navy-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles size={20} className="text-gold-400" />
                <h3 className="font-bold text-base">Créer un Nouveau Point de Restauration</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Auteur de la version
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Ex: Aymen Boulabeiz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
                  Description / Note de version
                </label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ex: Mise à jour de la grille des véhicules et ajout de la bannière promo VIP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gold-500 focus:outline-none resize-none"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Ce texte apparaîtra dans l&apos;historique pour identifier facilement cet instantané.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>{isCreating ? 'Enregistrement...' : 'Valider & Créer l\'instantané'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
