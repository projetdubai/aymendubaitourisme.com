'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  useEffect(() => {
    // Si déjà connecté, redirection directe vers le dashboard
    const isAuthSession = sessionStorage.getItem('admin_authenticated') === 'true' || 
                          sessionStorage.getItem('isAdminAuthenticated') === 'true';
    const isAuthCookie = typeof document !== 'undefined' && document.cookie.includes('admin_authenticated=true');

    if (isAuthSession || isAuthCookie) {
      router.replace(`/${locale}/admin/dashboard`);
    } else {
      setIsCheckingAuth(false);
    }
  }, [router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        sessionStorage.setItem('admin_user', JSON.stringify(data.user));
        document.cookie = 'admin_authenticated=true; path=/; max-age=604800; SameSite=Lax';

        router.push(`/${locale}/admin/dashboard`);
      } else {
        setError(data.message || 'Identifiant ou mot de passe incorrect.');
      }
    } catch {
      setError('Erreur de connexion au serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" dir="ltr">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block relative w-[180px] h-[50px] mb-4">
          <Image
            src="/logo.jpeg"
            alt="AYMEN DUBAI TOURISME"
            fill
            sizes="180px"
            className="object-contain"
            priority
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide uppercase">
          Espace <span className="text-gold-500">Administration</span>
        </h2>
        <p className="mt-2 text-sm text-cream-100/70">
          AYMEN DUBAI TOURISME — Connexion sécurisée
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-navy-800/80 backdrop-blur-md border border-navy-700 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cream-100 mb-1.5">
                Adresse Email / Identifiant
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cream-100/40">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aymenboulabeiz8@gmail.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-navy-900/60 border border-navy-700 rounded-lg text-white placeholder-cream-100/30 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cream-100 mb-1.5">
                Mot de passe
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cream-100/40">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-navy-900/60 border border-navy-700 rounded-lg text-white placeholder-cream-100/30 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent sm:text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-cream-100/60 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-gold-500" />
                Accès restreint à l&apos;équipe Aymen Dubai
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-navy-900 bg-gold-500 hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Connexion en cours...</span>
                ) : (
                  <>
                    <span>Se connecter au Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-navy-700/60 text-center">
            <Link
              href={`/${locale}`}
              className="text-xs text-gold-400 hover:text-gold-300 transition-colors font-medium"
            >
              ← Retour au site public
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
