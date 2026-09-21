'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Check, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Star, 
  AlertCircle, 
  XCircle, 
  Clock, 
  MessageSquareQuote, 
  User, 
  Plus, 
  ShieldCheck,
  Calendar,
  Pencil,
  X
} from 'lucide-react';
import { ReviewItem } from '@/lib/reviews';

export default function AdminReviewsModerationPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [editForm, setEditForm] = useState({
    author_name: '',
    rating: 5,
    service: '',
    country: '',
    comment: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [isAddingTest, setIsAddingTest] = useState(false);

  const showNotif = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenEdit = (r: ReviewItem) => {
    setEditingReview(r);
    setEditForm({
      author_name: r.author_name || r.name || '',
      rating: r.rating || 5,
      service: r.service || '',
      country: r.country || '',
      comment: r.comment || r.text || '',
      status: r.status || 'pending',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotif('Avis modifié et mis à jour avec succès !');
        setEditingReview(null);
        await fetchReviews();
      } else {
        showNotif(data.message || 'Erreur lors de la modification', 'error');
      }
    } catch {
      showNotif('Erreur réseau lors de la mise à jour', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews?status=all', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    // Auto-refresh every 20 seconds to catch incoming reviews in real-time
    const interval = setInterval(fetchReviews, 20000);
    return () => clearInterval(interval);
  }, [fetchReviews]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotif(
          status === 'approved' 
            ? 'Avis approuvé ! Il est maintenant affiché sur le site public.'
            : status === 'rejected'
            ? 'Avis refusé et retiré du site public.'
            : 'Statut de l\'avis mis à jour.'
        );
        await fetchReviews();
      } else {
        showNotif(data.message || 'Erreur lors de la mise à jour', 'error');
      }
    } catch {
      showNotif('Erreur réseau lors de la modération', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet avis ?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotif('Avis supprimé avec succès.');
        if (selectedReview?.id === id) setSelectedReview(null);
        await fetchReviews();
      } else {
        showNotif(data.message || 'Erreur lors de la suppression', 'error');
      }
    } catch {
      showNotif('Erreur réseau lors de la suppression', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddTestReview = async () => {
    setIsAddingTest(true);
    try {
      const sampleNames = ['Amine Khelifi (Client Test)', 'Sami Al-Nuaimi', 'Yassine Belkacem'];
      const sampleServices = ['تأشيرة قطر', 'تأجير السيارات الفخمة', 'حجز تذاكر الطيران', 'حجز الفنادق الفاخرة'];
      const sampleComments = [
        'Service irréprochable et très professionnel ! Visa reçu en 24h avec un suivi remarquable.',
        'تجربة ممتازة مع الأخ أيمن، حجزت فندق وسيارة في دبي وكانت الخدمة راقية وسريعة جداً.',
        'Accueil chaleureux à l\'aéroport et équipe toujours disponible sur WhatsApp. Bravo !'
      ];
      const randomIdx = Math.floor(Math.random() * sampleNames.length);

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: sampleNames[randomIdx],
          rating: 5,
          service: sampleServices[randomIdx],
          comment: sampleComments[randomIdx],
          country: 'Algérie 🇩🇿',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotif('Avis de test soumis ! Il apparaît en attente de modération ci-dessous.');
        setFilter('PENDING');
        await fetchReviews();
      }
    } catch {
      showNotif('Erreur lors de l\'ajout du test', 'error');
    } finally {
      setIsAddingTest(false);
    }
  };

  const pendingList = reviews.filter((r) => r.status === 'pending');
  const approvedList = reviews.filter((r) => r.status === 'approved');
  const rejectedList = reviews.filter((r) => r.status === 'rejected');

  const filteredReviews =
    filter === 'ALL'
      ? reviews
      : filter === 'PENDING'
      ? pendingList
      : filter === 'APPROVED'
      ? approvedList
      : rejectedList;

  const sortedReviews = [...filteredReviews].sort(
    (a, b) => new Date(b.created_at || b.date || '').getTime() - new Date(a.created_at || a.date || '').getTime()
  );

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl shadow-xl flex items-center gap-3 border animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : notification.type === 'error'
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-navy-800 text-white border-navy-700'
          }`}
        >
          {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-semibold">{notification.text}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gold-500/10 rounded-xl text-gold-600">
              <Star size={24} className="fill-gold-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
              Modération des Avis Clients
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Recevez et modérez en direct les avis laissés par vos visiteurs sur le site. Les avis approuvés sont immédiatement publiés.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchReviews}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleAddTestReview}
            disabled={isAddingTest}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-gold-400 rounded-xl shadow-xs transition-all disabled:opacity-50"
            title="Générer un avis test pour valider le flux de modération"
          >
            <Plus size={14} />
            <span>{isAddingTest ? 'Création...' : 'Créer un avis test'}</span>
          </button>
        </div>
      </div>

      {/* Pending Alert Banner */}
      {pendingList.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-950">
                {pendingList.length} avis client(s) en attente d&apos;approbation !
              </p>
              <p className="text-xs text-amber-800/80">
                Approuvez-les ci-dessous pour les afficher immédiatement sur la page d&apos;accueil du site.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Afficher les avis en attente
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
        {[
          { key: 'ALL' as const, label: 'Tous les avis', count: reviews.length },
          { key: 'PENDING' as const, label: 'En attente', count: pendingList.length, highlight: pendingList.length > 0 },
          { key: 'APPROVED' as const, label: 'Approuvés (En ligne)', count: approvedList.length },
          { key: 'REJECTED' as const, label: 'Refusés', count: rejectedList.length },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-navy-900 text-gold-400 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  tab.highlight
                    ? 'bg-amber-500 text-navy-950'
                    : isActive
                    ? 'bg-gold-500/20 text-gold-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reviews Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-3">
            <RefreshCw size={28} className="animate-spin text-gold-500" />
            <p className="text-sm font-medium">Chargement des avis clients...</p>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <MessageSquareQuote size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun avis ne correspond à ce filtre.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedReviews.map((r) => {
              const isPending = r.status === 'pending';
              const isApproved = r.status === 'approved';
              const isRejected = r.status === 'rejected';
              const isBusy = actionLoading === r.id;

              const authorName = r.author_name || r.name || 'Client Aymen Dubai';
              const commentText = r.comment || r.text || '';
              const dateFormatted = r.created_at
                ? new Date(r.created_at).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : r.date || 'Récemment';

              return (
                <div
                  key={r.id}
                  className={`p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isPending ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Left: Author, rating & message */}
                  <div className="space-y-2 flex-1">
                    {/* Meta bar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-navy-900 text-sm flex items-center gap-1.5">
                        <User size={15} className="text-gold-500" />
                        {authorName}
                      </span>

                      {r.country && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {r.country}
                        </span>
                      )}

                      {r.service && (
                        <span className="text-xs font-semibold text-navy-800 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                          {r.service}
                        </span>
                      )}

                      {/* Status badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          En attente de modération
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check size={12} className="stroke-[3]" />
                          Publié en ligne
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                          <XCircle size={12} />
                          Refusé (Masqué)
                        </span>
                      )}

                      <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto lg:ml-0">
                        <Clock size={12} />
                        {dateFormatted}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 text-gold-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={star <= (r.rating || 5) ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-600 ml-1">
                        ({r.rating || 5}/5)
                      </span>
                    </div>

                    {/* Comment text snippet */}
                    <p className="text-sm text-gray-800 leading-relaxed italic bg-white/80 p-3 rounded-xl border border-gray-100">
                      &ldquo;{commentText}&rdquo;
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => setSelectedReview(r)}
                      className="p-2 text-gray-500 hover:text-navy-900 hover:bg-gray-100 rounded-xl transition-colors"
                      title="Afficher les détails complets"
                    >
                      <Eye size={17} />
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-all"
                      title="Modifier le contenu ou corriger les fautes"
                    >
                      <Pencil size={13} />
                      <span>Modifier</span>
                    </button>

                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r.id, 'approved')}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                        title="Valider et publier immédiatement sur le site public"
                      >
                        <Check size={14} className="stroke-[3]" />
                        <span>{isBusy ? 'Validation...' : 'Approuver'}</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r.id, 'rejected')}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                        title="Refuser et masquer cet avis"
                      >
                        <XCircle size={14} />
                        <span>Refuser</span>
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      disabled={isBusy}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Supprimer définitivement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-gray-100 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  {selectedReview.author_name || selectedReview.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedReview.country} • ID : {selectedReview.id}
                </p>
              </div>
              <span className="font-mono text-xs text-gray-400">
                {selectedReview.date || selectedReview.created_at?.split('T')[0]}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gold-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= (selectedReview.rating || 5) ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-xs font-bold text-navy-900 ml-1.5">
                    {selectedReview.rating}/5
                  </span>
                </div>

                {selectedReview.service && (
                  <span className="text-xs font-semibold bg-gold-500/10 text-gold-700 border border-gold-500/20 px-3 py-1 rounded-full">
                    {selectedReview.service}
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Contenu du témoignage :
                </span>
                <p className="text-navy-900 bg-gray-50 p-4 rounded-2xl text-sm leading-relaxed border border-gray-100 italic">
                  &ldquo;{selectedReview.comment || selectedReview.text}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleDelete(selectedReview.id)}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
              >
                Supprimer cet avis
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const rev = selectedReview;
                    setSelectedReview(null);
                    handleOpenEdit(rev);
                  }}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Pencil size={13} />
                  <span>Modifier</span>
                </button>

                {selectedReview.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedReview.id, 'approved');
                      setSelectedReview(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Approuver & Publier
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Edit Modal */}
      {editingReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setEditingReview(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-5 border border-gray-100 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Modifier l&apos;Avis Client
                  </h3>
                  <p className="text-xs text-gray-500">
                    Corrigez les fautes d&apos;orthographe, ajustez la note ou le statut avant publication.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.author_name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, author_name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-gold-500 focus:outline-none"
                    placeholder="Ex: Mohammed Al-Rashid"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Pays / Ville
                  </label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-gold-500 focus:outline-none"
                    placeholder="Ex: Dubaï 🇦🇪, Algérie 🇩🇿"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Service concerné
                  </label>
                  <input
                    type="text"
                    value={editForm.service}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, service: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-gold-500 focus:outline-none"
                    placeholder="Ex: تأشيرة قطر, تأجير السيارات"
                    list="services-suggestions"
                  />
                  <datalist id="services-suggestions">
                    <option value="تأشيرة دبي والسياحة" />
                    <option value="تأشيرة قطر" />
                    <option value="تأشيرة سلطنة عُمان" />
                    <option value="تأجير السيارات الفخمة" />
                    <option value="حجز الفنادق الفاخرة" />
                    <option value="حجز تذاكر الطيران" />
                    <option value="الاستثمار العقاري" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Statut de modération
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-gold-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="approved">Approuvé (En ligne sur le site)</option>
                    <option value="pending">En attente de modération</option>
                    <option value="rejected">Refusé (Masqué)</option>
                  </select>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Note attribuée ({editForm.rating}/5 étoiles)
                </label>
                <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm((prev) => ({ ...prev, rating: star }))}
                      className="p-1 text-gold-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        className={star <= editForm.rating ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Commentaire / Message du client
                </label>
                <textarea
                  required
                  rows={4}
                  value={editForm.comment}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-gold-500 focus:outline-none leading-relaxed"
                  placeholder="Texte du témoignage..."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingEdit ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{isSavingEdit ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
