'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  MessageSquare, 
  Star, 
  Building2, 
  Car, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Globe, 
  KeyRound,
  Users,
  Activity,
  Eye,
  TrendingUp,
  FileCheck,
  Plane,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import DataTable from '@/components/admin/DataTable';
import DeployButton from '@/components/admin/DeployButton';

export default function AdminDashboardHome() {
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  const [reviews, setReviews] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [adminsCount, setAdminsCount] = useState<number>(1);
  const [analytics, setAnalytics] = useState<{
    total: number;
    today: number;
    week: number;
    month: number;
    chartLast7Days: Array<{ date: string; label: string; count: number }>;
    recent: Array<{ timestamp: string; path: string; locale: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [revRes, quotRes, propRes, admRes, carRes, anaRes] = await Promise.all([
          fetch('/api/reviews?status=all', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ reviews: [] })),
          fetch('/api/admin/quotes', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ quotes: [] })),
          fetch('/api/admin/properties', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ properties: [] })),
          fetch('/api/admin/users', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ admins: [] })),
          fetch('/api/admin/cars', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ cars: [] })),
          fetch('/api/admin/analytics', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ stats: null })),
        ]);

        setReviews(revRes.reviews || []);
        setQuotes(quotRes.quotes || []);
        setProperties(propRes.properties || []);
        setAdminsCount(admRes.admins?.length || 1);
        setCars(carRes.cars || []);
        if (anaRes.stats) {
          setAnalytics(anaRes.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const newQuotes = quotes.filter((q) => q.status === 'NEW');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'NEW': 'bg-blue-100 text-blue-700',
      'READ': 'bg-gray-100 text-gray-700',
      'REPLIED': 'bg-green-100 text-green-700',
      'pending': 'bg-amber-100 text-amber-700',
      'approved': 'bg-green-100 text-green-700',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const quoteColumns = [
    { key: 'date', label: 'Date' },
    { key: 'name', label: 'Nom' },
    { key: 'service', label: 'Service' },
    { key: 'status', label: 'Statut', render: (row: any) => getStatusBadge(row.status) },
  ];

  const reviewColumns = [
    { key: 'date', label: 'Date' },
    { key: 'name', label: 'Client' },
    { key: 'rating', label: 'Note', render: (row: any) => (
      <span className="text-gold-500">
        {'★'.repeat(row.rating)}
        <span className="text-gray-300">{'★'.repeat(5 - row.rating)}</span>
      </span>
    )},
    { key: 'status', label: 'Statut', render: (row: any) => getStatusBadge(row.status) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-navy-800">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Tableau de Bord — <span className="text-gold-500">AYMEN DUBAI TOURISME</span>
          </h2>
          <p className="text-cream-100/70 text-sm mt-1">
            Contrôle total : modifications en direct, gestion des administrateurs, avis clients et devis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}/admin/dashboard/content`}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 text-sm font-bold rounded-xl shadow transition-colors"
          >
            <Globe size={16} />
            <span>Modifier le site (CMS)</span>
          </Link>
          <Link
            href={`/${locale}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-cream-100 text-sm font-medium rounded-xl border border-navy-700 transition-colors"
          >
            <ExternalLink size={16} />
            <span>Voir le site public</span>
          </Link>
        </div>
      </div>

      {/* 1-Click Production Deployment Card */}
      <DeployButton variant="card" />

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href={`/${locale}/admin/dashboard/cars`}
          className="p-4 bg-white rounded-xl shadow-xs border border-gray-100 hover:border-red-500/40 hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <Car size={20} />
          </div>
          <div>
            <p className="font-bold text-sm text-navy-900">Voitures & Flotte</p>
            <p className="text-xs text-gray-500">{cars.length} véhicule(s)</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/dashboard/content`}
          className="p-4 bg-white rounded-xl shadow-xs border border-gray-100 hover:border-gold-500/40 hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-gold-500/10 text-gold-600 group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors">
            <Globe size={20} />
          </div>
          <div>
            <p className="font-bold text-sm text-navy-900">Modifier le site</p>
            <p className="text-xs text-gray-500">Textes, contacts, forfaits</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/dashboard/admins`}
          className="p-4 bg-white rounded-xl shadow-xs border border-gray-100 hover:border-blue-500/40 hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <KeyRound size={20} />
          </div>
          <div>
            <p className="font-bold text-sm text-navy-900">Ajouter un admin</p>
            <p className="text-xs text-gray-500">{adminsCount} compte(s) actif(s)</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/dashboard/reviews`}
          className="p-4 bg-white rounded-xl shadow-xs border border-gray-100 hover:border-amber-500/40 hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Star size={20} />
          </div>
          <div>
            <p className="font-bold text-sm text-navy-900">Modérer les avis</p>
            <p className="text-xs text-amber-700 font-semibold">{pendingReviews.length} en attente</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/dashboard/quotes`}
          className="p-4 bg-white rounded-xl shadow-xs border border-gray-100 hover:border-green-500/40 hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="font-bold text-sm text-navy-900">Demandes de devis</p>
            <p className="text-xs text-gray-500">{newQuotes.length} nouveau(x)</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard 
          title="Parc Voitures" 
          value={isLoading ? '...' : String(cars.length)} 
          icon={Car} 
          iconColorClass="text-red-600 bg-red-50"
          trend={cars.filter(c => c.status === 'Disponible').length > 0 ? "up" : undefined}
          trendValue={cars.filter(c => c.status === 'Disponible').length > 0 ? `${cars.filter(c => c.status === 'Disponible').length} dispo` : undefined}
        />
        <StatsCard 
          title="Demandes de Devis" 
          value={isLoading ? '...' : String(quotes.length)} 
          icon={MessageSquare} 
          iconColorClass="text-blue-600 bg-blue-50"
          trend={newQuotes.length > 0 ? "up" : undefined}
          trendValue={newQuotes.length > 0 ? `${newQuotes.length} nouv.` : undefined}
        />
        <StatsCard 
          title="Biens Immobiliers" 
          value={isLoading ? '...' : String(properties.length)} 
          icon={Building2} 
          iconColorClass="text-purple-600 bg-purple-50"
        />
        <StatsCard 
          title="Avis en Attente" 
          value={isLoading ? '...' : String(pendingReviews.length)} 
          icon={Clock} 
          iconColorClass="text-amber-600 bg-amber-50"
          trend={pendingReviews.length > 0 ? "up" : undefined}
          trendValue={pendingReviews.length > 0 ? "À valider" : undefined}
        />
        <StatsCard 
          title="Avis Validés Publics" 
          value={isLoading ? '...' : String(approvedReviews.length)} 
          icon={CheckCircle} 
          iconColorClass="text-green-600 bg-green-50"
        />
      </div>

      {/* Quick Access Modules: Visas, Flights, Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link 
          href={`/${locale}/admin/dashboard/visas`}
          className="bg-white rounded-2xl p-5 shadow-xs border border-cream-200 hover:border-gold-500 hover:shadow-lg transition-all duration-300 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold-50 text-gold-600 rounded-xl group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors">
              <FileCheck size={26} />
            </div>
            <div>
              <h4 className="font-extrabold text-navy-900 text-base group-hover:text-gold-600 transition-colors">
                Visas &amp; Séjours
              </h4>
              <p className="text-xs text-navy-500 mt-0.5">30j, 60j, Prolongations &amp; GCC</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gold-500 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link 
          href={`/${locale}/admin/dashboard/flights`}
          className="bg-white rounded-2xl p-5 shadow-xs border border-cream-200 hover:border-gold-500 hover:shadow-lg transition-all duration-300 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Plane size={26} />
            </div>
            <div>
              <h4 className="font-extrabold text-navy-900 text-base group-hover:text-gold-600 transition-colors">
                Billetterie &amp; Vols
              </h4>
              <p className="text-xs text-navy-500 mt-0.5">Liaisons directes &amp; Classes VIP</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gold-500 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link 
          href={`/${locale}/admin/dashboard/services`}
          className="bg-white rounded-2xl p-5 shadow-xs border border-cream-200 hover:border-gold-500 hover:shadow-lg transition-all duration-300 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Sparkles size={26} />
            </div>
            <div>
              <h4 className="font-extrabold text-navy-900 text-base group-hover:text-gold-600 transition-colors">
                Gestion des Services
              </h4>
              <p className="text-xs text-navy-500 mt-0.5">8 prestations 100% dynamiques</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gold-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Real-Time Visitor Audience Analytics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-navy-900 text-base sm:text-lg flex items-center gap-2">
              <Activity size={20} className="text-gold-500" />
              Audience &amp; Visiteurs en Temps Réel
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Suivi respectueux de la vie privée (sans cookies intrusifs) du trafic sur votre site.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Traqueur Actif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Visiteurs</p>
              <p className="text-xl font-extrabold text-navy-900">
                {isLoading ? '...' : analytics?.total?.toLocaleString('fr-FR') || '0'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <Eye size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Aujourd&apos;hui</p>
              <p className="text-xl font-extrabold text-emerald-700">
                {isLoading ? '...' : `+${analytics?.today?.toLocaleString('fr-FR') || '0'}`}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">7 Derniers Jours</p>
              <p className="text-xl font-extrabold text-navy-900">
                {isLoading ? '...' : analytics?.week?.toLocaleString('fr-FR') || '0'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">30 Derniers Jours</p>
              <p className="text-xl font-extrabold text-navy-900">
                {isLoading ? '...' : analytics?.month?.toLocaleString('fr-FR') || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-gold-500" />
              Dernières Demandes de Devis ({quotes.length})
            </h3>
            <Link 
              href={`/${locale}/admin/dashboard/quotes`}
              className="text-xs text-gold-600 hover:text-gold-700 font-semibold uppercase tracking-wider"
            >
              Gérer les devis →
            </Link>
          </div>
          <div className="p-0">
            <DataTable columns={quoteColumns} data={quotes.slice(0, 5)} emptyMessage="Aucun devis pour l'instant." />
          </div>
        </div>

        {/* Recent Reviews with Moderation link */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <Star size={18} className="text-gold-500" />
              Avis Clients ({reviews.length})
            </h3>
            <Link 
              href={`/${locale}/admin/dashboard/reviews`}
              className="text-xs text-gold-600 hover:text-gold-700 font-semibold uppercase tracking-wider"
            >
              Modérer les avis →
            </Link>
          </div>
          <div className="p-0">
            <DataTable 
              columns={reviewColumns} 
              data={reviews.slice(0, 5)} 
              emptyMessage="Aucun avis enregistré pour l'instant." 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
