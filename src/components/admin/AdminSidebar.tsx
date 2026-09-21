'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Star, 
  Building2, 
  Car,
  Globe,
  KeyRound,
  ExternalLink,
  History,
  FolderOpen,
  LogOut,
  Menu,
  X,
  FileCheck,
  Plane,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';
  const [isOpen, setIsOpen] = useState(false);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      try {
        const res = await fetch('/api/reviews?status=pending');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.pendingCount === 'number') {
            setPendingReviewsCount(data.pendingCount);
          } else if (Array.isArray(data.reviews)) {
            setPendingReviewsCount(data.reviews.length);
          }
        }
      } catch (err) {
        // Silently fail on network hiccups
      }
    };

    fetchPendingReviews();
    const interval = setInterval(fetchPendingReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { 
      href: `/${locale}/admin/dashboard`, 
      icon: LayoutDashboard, 
      label: 'Tableau de bord', 
      exact: true 
    },
    { 
      href: `/${locale}/admin/dashboard/content`, 
      icon: Globe, 
      label: 'Modifier le site & boutons' 
    },
    { 
      href: `/${locale}/admin/dashboard/versions`, 
      icon: History, 
      label: 'Versions & Restauration' 
    },
    { 
      href: `/${locale}/admin/dashboard/media`, 
      icon: FolderOpen, 
      label: 'Médiathèque Globale' 
    },
    { 
      href: `/${locale}/admin/dashboard/cars`, 
      icon: Car, 
      label: 'Voitures & Flotte' 
    },
    { 
      href: `/${locale}/admin/dashboard/reviews`, 
      icon: Star, 
      label: 'Modération des Avis' 
    },
    { 
      href: `/${locale}/admin/dashboard/quotes`, 
      icon: MessageSquare, 
      label: 'Demandes de devis' 
    },
    { 
      href: `/${locale}/admin/dashboard/properties`, 
      icon: Building2, 
      label: 'Immobilier' 
    },
    { 
      href: `/${locale}/admin/dashboard/visas`, 
      icon: FileCheck, 
      label: 'Visas & Séjours' 
    },
    { 
      href: `/${locale}/admin/dashboard/flights`, 
      icon: Plane, 
      label: 'Billetterie & Vols' 
    },
    { 
      href: `/${locale}/admin/dashboard/services`, 
      icon: Sparkles, 
      label: 'Gestion des Services' 
    },
    { 
      href: `/${locale}/admin/dashboard/admins`, 
      icon: KeyRound, 
      label: 'Gestion des Admins' 
    },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href || pathname === href + '/';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('isAdminAuthenticated');
    sessionStorage.removeItem('admin_user');
    document.cookie = 'admin_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push(`/${locale}/admin`);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-navy-900 text-white rounded-lg shadow-lg border border-navy-700"
        onClick={toggleSidebar}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-[270px] bg-navy-900 text-white transition-transform duration-300 ease-in-out flex flex-col border-r border-navy-800 shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo & Company Name */}
        <div className="flex flex-col items-center justify-center py-6 px-4 border-b border-navy-800">
          <div className="relative w-[150px] h-[40px] mb-2">
            <Image
              src="/logo.jpeg"
              alt="AYMEN DUBAI TOURISME"
              fill
              sizes="150px"
              className="object-contain"
            />
          </div>
          <span className="text-xs tracking-wider text-gold-500 font-bold uppercase">
            Panneau d&apos;administration
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-5 px-3">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                      active 
                        ? "bg-gold-500 text-navy-900 font-bold shadow-md shadow-gold-500/20" 
                        : "text-cream-100/80 hover:bg-navy-800 hover:text-white"
                    )}
                  >
                    <item.icon size={19} className={active ? "text-navy-900" : "text-gold-400"} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.href.includes('/reviews') && pendingReviewsCount > 0 && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[11px] font-extrabold shadow-xs transition-transform",
                        active ? "bg-navy-900 text-gold-400" : "bg-amber-500 text-navy-950 animate-pulse"
                      )}>
                        {pendingReviewsCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="pt-5 mt-5 border-t border-navy-800/80">
            <Link
              href={`/${locale}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-cream-100/70 hover:bg-navy-800 hover:text-gold-400 transition-colors"
            >
              <ExternalLink size={18} className="text-gold-500" />
              <span>Voir le site public</span>
            </Link>
          </div>
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/40">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-gold-500 shadow-sm shrink-0 bg-gold-500">
              <Image
                src="/aymen-boulabeiz.jpg"
                alt="Aymen Boulabeiz"
                fill
                className="object-cover"
              />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Aymen Boulabeiz</p>
              <p className="text-[11px] text-gold-400/80 truncate">Fondateur & Super Admin</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium transition-colors border border-red-500/20"
          >
            <LogOut size={16} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </>
  );
}
