'use client';

import { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/admin/DataTable';
import { Search, Eye, Trash2, MessageCircle, RefreshCw, CheckCircle2, Clock, Mail } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';

interface QuoteItem {
  id: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  country?: string;
  travelers?: number;
  travelDate?: string;
  message?: string;
  status: 'NEW' | 'READ' | 'REPLIED';
}

export default function DashboardQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/quotes');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setQuotes(data.quotes || []);
        }
      }
    } catch (err) {
      console.error('Failed to load quotes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        if (selectedQuote && selectedQuote.id === id) {
          setSelectedQuote({ ...selectedQuote, status: newStatus as any });
        }
        await fetchQuotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Voulez-vous supprimer cette demande de devis ?')) return;

    try {
      const res = await fetch(`/api/admin/quotes?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSelectedQuote(null);
        await fetchQuotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'NEW': 'bg-blue-100 text-blue-800 border-blue-200',
      'READ': 'bg-amber-100 text-amber-800 border-amber-200',
      'REPLIED': 'bg-green-100 text-green-800 border-green-200',
    };
    const labels: Record<string, string> = {
      'NEW': 'NOUVEAU',
      'READ': 'EN COURS',
      'REPLIED': 'RÉPONDU',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const columns = [
    { key: 'id', label: 'Réf.' },
    { key: 'date', label: 'Date' },
    { key: 'name', label: 'Client' },
    { key: 'service', label: 'Prestation demandée' },
    {
      key: 'phone',
      label: 'Téléphone / WhatsApp',
      render: (row: QuoteItem) => (
        <a
          href={getWhatsAppUrl(row.phone, `Bonjour ${row.name}, suite à votre demande sur AYMEN DUBAI TOURISME concernant : ${row.service}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs flex items-center gap-1.5 text-green-700 hover:underline"
          title="Contacter sur WhatsApp"
        >
          <MessageCircle size={14} className="text-[#25D366]" />
          <span dir="ltr">{row.phone}</span>
        </a>
      ),
    },
    { key: 'status', label: 'Statut', render: (row: QuoteItem) => getStatusBadge(row.status) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: QuoteItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedQuote(row);
              if (row.status === 'NEW') handleUpdateStatus(row.id, 'READ');
            }}
            className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="Consulter le devis"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDeleteQuote(row.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filteredQuotes = quotes.filter((q) => {
    const matchesFilter = filter === 'ALL' || q.status === filter;
    const matchesSearch =
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.service.toLowerCase().includes(search.toLowerCase()) ||
      q.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Demandes de Devis Reçues</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Consultez les demandes des clients, modifiez leur état et répondez directement sur WhatsApp.
          </p>
        </div>

        <button
          onClick={fetchQuotes}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'ALL', label: `Tous (${quotes.length})` },
            { key: 'NEW', label: `Nouveaux (${quotes.filter((q) => q.status === 'NEW').length})` },
            { key: 'READ', label: `En cours (${quotes.filter((q) => q.status === 'READ').length})` },
            { key: 'REPLIED', label: `Répondus (${quotes.filter((q) => q.status === 'REPLIED').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === tab.key ? 'bg-navy-900 text-gold-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, service..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl">
          <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable columns={columns} data={filteredQuotes} emptyMessage="Aucune demande de devis." />
      )}

      {/* Detail Modal */}
      {selectedQuote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedQuote(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy-900">{selectedQuote.name}</h3>
                <p className="text-xs text-gray-500">Réf: {selectedQuote.id} • {selectedQuote.date}</p>
              </div>
              {getStatusBadge(selectedQuote.status)}
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Service demandé :</span>
                <span className="font-bold text-navy-900">{selectedQuote.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Email :</span>
                <span className="font-medium text-navy-900">{selectedQuote.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Téléphone :</span>
                <span className="font-mono font-bold text-navy-900" dir="ltr">{selectedQuote.phone}</span>
              </div>
              {selectedQuote.country && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Pays de résidence :</span>
                  <span className="font-medium text-navy-900">{selectedQuote.country}</span>
                </div>
              )}
              {selectedQuote.travelDate && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Date de voyage prévue :</span>
                  <span className="font-medium text-navy-900">{selectedQuote.travelDate}</span>
                </div>
              )}
              {selectedQuote.travelers && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Nombre de personnes :</span>
                  <span className="font-medium text-navy-900">{selectedQuote.travelers}</span>
                </div>
              )}

              {selectedQuote.message && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-500 block mb-1">Message ou précisions :</span>
                  <p className="bg-gray-50 p-3 rounded-xl text-gray-800 text-xs leading-relaxed italic border">
                    &ldquo;{selectedQuote.message}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Quick Status Selector */}
            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">Mettre à jour le statut :</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'NEW')}
                  className={`px-2.5 py-1 text-xs rounded font-bold transition-colors ${selectedQuote.status === 'NEW' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'}`}
                >
                  Nouveau
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'READ')}
                  className={`px-2.5 py-1 text-xs rounded font-bold transition-colors ${selectedQuote.status === 'READ' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'}`}
                >
                  En cours
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'REPLIED')}
                  className={`px-2.5 py-1 text-xs rounded font-bold transition-colors ${selectedQuote.status === 'REPLIED' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-900 hover:bg-green-200'}`}
                >
                  Traité
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center gap-2 pt-4 border-t">
              <a
                href={getWhatsAppUrl(selectedQuote.phone, `Bonjour ${selectedQuote.name}, AYMEN DUBAI TOURISME vous contacte au sujet de votre demande de devis (${selectedQuote.service}).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold shadow transition-colors"
              >
                <MessageCircle size={16} />
                <span>Répondre sur WhatsApp</span>
              </a>

              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
