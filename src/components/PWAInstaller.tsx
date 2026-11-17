"use client";

import { useEffect, useState } from 'react';
import { Download, X, Smartphone, Monitor, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const MAX_PROMPT_COUNT = 3;
const DISMISS_COUNT_KEY = 'TOTALENERGIES_PWA_DISMISS_COUNT';

declare global {
  interface Window {
    triggerPWAInstall?: () => void;
    deferredPWAEvent?: BeforeInstallPromptEvent | null;
  }
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissCount, setDismissCount] = useState<number>(0);

  // Fonction universelle d'installation : déclenche l'installation native OU télécharge le setup Windows si besoin
  const executeInstall = async (promptEvent: BeforeInstallPromptEvent | null) => {
    const promptToUse = promptEvent || deferredPrompt || window.deferredPWAEvent;

    if (promptToUse) {
      try {
        promptToUse.prompt();
        const { outcome } = await promptToUse.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
        window.deferredPWAEvent = null;
        return;
      } catch (e) {
        console.warn('Erreur prompt PWA natif, passage au setup téléchargeable:', e);
      }
    }

    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // Si le prompt natif du navigateur n'est pas encore prêt ou a déjà été consommé,
    // on lance le téléchargement immédiat du script de setup Windows
    const link = document.createElement('a');
    link.href = '/setup/installer-station.bat';
    link.download = 'Installer-TotalEnergies-Station.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowPrompt(false);
  };

  useEffect(() => {
    // 1. Enregistrement du Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ ServiceWorker PWA TotalEnergies actif:', registration.scope);
          })
          .catch((err) => {
            console.warn('⚠️ Échec enregistrement ServiceWorker:', err);
          });
      });
    }

    // 2. Détection si l'application est déjà lancée en mode autonome (PWA installée)
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Détection iOS / Safari
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Enregistrer la méthode globale d'installation pour la Navbar
      window.triggerPWAInstall = () => {
        executeInstall(window.deferredPWAEvent || deferredPrompt);
      };

      // Gestion du compteur de refus (autorisé 3 fois)
      const storedCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10);
      setDismissCount(storedCount);

      if (storedCount < MAX_PROMPT_COUNT) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }

    // 3. Écoute de l'événement natif d'installation Chrome / Android / Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      window.deferredPWAEvent = event;

      window.triggerPWAInstall = () => {
        executeInstall(event);
      };

      const storedCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10);
      if (storedCount < MAX_PROMPT_COUNT) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      window.deferredPWAEvent = null;
      localStorage.setItem(DISMISS_COUNT_KEY, MAX_PROMPT_COUNT.toString());
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [deferredPrompt, isIOS]);

  const handleDismiss = () => {
    setShowPrompt(false);
    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    localStorage.setItem(DISMISS_COUNT_KEY, newCount.toString());
  };

  if (isInstalled || !showPrompt) {
    return (
      <>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-red-500/40 p-6 rounded-2xl max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-red-500" /> Installer sur iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <p>1. Appuyez sur le bouton <strong>Partager</strong> en bas de Safari (icône flèche vers le haut).</p>
                <p>2. Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</p>
                <p>3. Cliquez sur <strong>Ajouter</strong> en haut à droite.</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
              >
                J'ai compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  const remainingTries = MAX_PROMPT_COUNT - dismissCount;

  return (
    <>
      {/* Toast d'invitation à l'installation */}
      <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900/95 border-2 border-red-500/60 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-red-950/60 flex items-start gap-3.5 animate-in slide-in-from-bottom duration-300">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-900/50">
          <Download className="w-6 h-6 animate-pulse" />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1.5">
              <span>Installer l'Application</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-950 text-red-400 border border-red-800">
                Rappel ({dismissCount + 1}/{MAX_PROMPT_COUNT})
              </span>
            </h4>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded transition"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Installez <strong>TotalEnergies Station</strong> pour une utilisation directe hors-ligne, sans navigateur et en plein écran.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => executeInstall(deferredPrompt)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Installer l'App
            </button>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-semibold transition"
            >
              Plus tard {remainingTries > 1 && `(${remainingTries - 1} rappel${remainingTries - 1 > 1 ? 's' : ''})`}
            </button>
          </div>
        </div>
      </div>

      {/* Guide spécifique pour iOS si nécessaire */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-red-500" /> Installer sur iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <p>1. Appuyez sur le bouton <strong>Partager</strong> en bas de Safari (icône flèche vers le haut).</p>
              <p>2. Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</p>
              <p>3. Cliquez sur <strong>Ajouter</strong> en haut à droite.</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
