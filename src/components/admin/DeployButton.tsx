'use client';

import { useState } from 'react';
import { 
  Rocket, 
  Check, 
  X, 
  AlertCircle, 
  ExternalLink, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Sparkles,
  Globe
} from 'lucide-react';

interface DeployButtonProps {
  className?: string;
  variant?: 'header' | 'card' | 'sidebar' | 'saveAndDeploy';
  onBeforeDeploy?: () => Promise<boolean> | boolean;
}

export default function DeployButton({ className = '', variant = 'header', onBeforeDeploy }: DeployButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [deployHookUrl, setDeployHookUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    if (status === 'idle') {
      fetch('/api/admin/deploy')
        .then((r) => r.json())
        .then((data) => {
          if (data.deployHookUrl) setDeployHookUrl(data.deployHookUrl);
        })
        .catch(() => {});
    }
  };

  const handleTriggerDeploy = async () => {
    setIsDeploying(true);
    setStatus('running');
    setResult(null);

    if (onBeforeDeploy) {
      try {
        const ok = await onBeforeDeploy();
        if (ok === false) {
          setIsDeploying(false);
          setStatus('idle');
          return;
        }
      } catch (err: any) {
        console.warn('onBeforeDeploy failed:', err);
      }
    }

    try {
      const res = await fetch('/api/admin/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deployHookUrl: deployHookUrl || undefined }),
      });

      const data = await res.json();
      setResult(data);

      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err: any) {
      setStatus('error');
      setResult({
        error: err.message || 'Erreur réseau lors de la communication avec le serveur.',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      {/* Trigger Button based on variant */}
      {variant === 'header' && (
        <button
          onClick={handleOpen}
          className={`flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-900 font-extrabold text-xs rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer border border-gold-400/50 ${className}`}
          title="Mettre en ligne toutes les modifications sur www.aymendubaitourisme.com"
        >
          <Rocket size={15} className="animate-bounce" />
          <span className="hidden sm:inline">Publier en 1 Clic</span>
          <span className="sm:hidden">Publier</span>
        </button>
      )}

      {variant === 'saveAndDeploy' && (
        <button
          onClick={handleOpen}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 hover:from-navy-800 hover:to-navy-700 text-gold-400 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer border border-gold-500/40 ${className}`}
          title="Enregistrer et Déployer directement en production sur Vercel (1 Clic)"
        >
          <Rocket size={16} className="animate-bounce text-gold-400" />
          <span>Enregistrer &amp; Déployer en 1 Clic (Vercel)</span>
        </button>
      )}

      {variant === 'card' && (
        <div className={`bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white p-6 rounded-2xl shadow-lg border border-gold-500/30 relative overflow-hidden ${className}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div className="space-y-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Publication Vercel Production</span>
              </div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                Publier tout le site en 1 clic (npx vercel --prod)
              </h3>
              <p className="text-xs text-cream-100/75 leading-relaxed">
                Appliquez immédiatement toutes vos modifications (voitures, photos, textes, forfaits et prix) sur votre nom de domaine officiel <strong>www.aymendubaitourisme.com</strong>.
              </p>
            </div>

            <button
              onClick={handleOpen}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-900 font-extrabold text-sm rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Rocket size={18} />
              <span>🚀 Déployer en Production</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-navy-900 text-white p-5 flex justify-between items-center border-b border-navy-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gold-500/20 text-gold-400 rounded-xl">
                  <Rocket size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Mise en Ligne en 1 Clic (Production)
                  </h3>
                  <p className="text-xs text-cream-100/70">
                    Déploiement automatique : <span className="font-mono text-gold-400">npx vercel --prod</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Status Display */}
              {status === 'idle' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gold-50/70 border border-gold-200 text-xs text-navy-900 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-gold-700">
                      <Sparkles size={16} />
                      Prêt pour le déploiement public
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      En cliquant sur le bouton ci-dessous, le serveur va compiler vos dernières modifications, synchroniser les photos et mettre à jour votre site en direct sur le web pour tous vos visiteurs.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                    <p className="font-bold text-gray-700">Modifications qui seront publiées :</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Toutes les voitures et photos ajoutées ou modifiées</li>
                      <li>Tous les biens immobiliers et tarifs mis à jour</li>
                      <li>Tous les textes, boutons et coordonnées modifiés dans le CMS</li>
                      <li>Les avis clients approuvés pour affichage</li>
                    </ul>
                  </div>
                </div>
              )}

              {status === 'running' && (
                <div className="py-8 text-center space-y-4">
                  <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
                    <Rocket size={24} className="text-gold-600 animate-pulse absolute" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-navy-900">
                      Déploiement en cours sur Vercel...
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Exécution de <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-navy-900 font-bold">npx vercel --prod</span>. Cela prend généralement entre 30 et 60 secondes.
                    </p>
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="p-5 bg-green-50 border border-green-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check size={26} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 text-lg">
                      Mise en Ligne Réussie !
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      Votre site est maintenant à jour et consultable par vos clients.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href="https://www.aymendubaitourisme.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl shadow transition-colors"
                    >
                      <Globe size={15} />
                      <span>Ouvrir www.aymendubaitourisme.com</span>
                      <ExternalLink size={13} />
                    </a>

                    {result?.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <span>Lien direct Vercel</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-5 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                      <AlertCircle size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-900 text-sm">
                        Déploiement direct via CLI incomplet
                      </h4>
                      <p className="text-xs text-red-700 mt-0.5">
                        {result?.message || result?.error || "La commande npx vercel nécessite une confirmation ou vos identifiants."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-red-100 text-xs space-y-2">
                    <p className="font-bold text-navy-900">Pour finaliser la mise en ligne instantanée :</p>
                    <div className="space-y-1 text-gray-600">
                      <p>
                        1. Dans votre terminal, lancez simplement :
                      </p>
                      <code className="block bg-gray-900 text-green-400 p-2 rounded-lg font-mono text-[11px] select-all">
                        npx vercel --prod
                      </code>
                      <p className="pt-1">
                        2. Ou configurez un <strong>Vercel Deploy Hook</strong> dans les réglages ci-dessous pour déployer à 100% sans jamais ouvrir le terminal !
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs Drawer */}
              {result?.output && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-xs font-semibold text-gray-700 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal size={14} className="text-gray-500" />
                      Journal technique du déploiement
                    </span>
                    {showLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showLogs && (
                    <pre className="p-3 bg-gray-900 text-gray-200 text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
                      {result.output}
                    </pre>
                  )}
                </div>
              )}

              {/* Optional Deploy Hook Settings */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-xs text-gray-500 hover:text-navy-900 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <span>{showSettings ? '▲ Masquer' : '⚙️ Configurer un Vercel Deploy Hook (Optionnel)'}</span>
                </button>

                {showSettings && (
                  <div className="mt-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                    <label className="block font-bold text-gray-700">
                      URL du Deploy Hook Vercel :
                    </label>
                    <input
                      type="url"
                      placeholder="https://api.vercel.com/v1/integrations/deploy/prj_.../..."
                      value={deployHookUrl}
                      onChange={(e) => setDeployHookUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-gold-500"
                    />
                    <p className="text-[11px] text-gray-500">
                      Trouvez ce lien dans : <em>Vercel Dashboard → Votre Projet → Settings → Git → Deploy Hooks</em>. Une fois collé ici, vos déploiements en 1 clic seront 100% instantanés.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={handleTriggerDeploy}
                disabled={isDeploying}
                className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-extrabold text-xs rounded-xl shadow-md transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Déploiement en cours...</span>
                  </>
                ) : (
                  <>
                    <Rocket size={15} />
                    <span>{status === 'success' ? 'Redéployer à nouveau' : 'Lancer la mise en ligne (1 Clic)'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
