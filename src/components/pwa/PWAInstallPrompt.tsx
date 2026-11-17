"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const MAX_PROMPT_COUNT = 3;
const DISMISS_COUNT_KEY = "pwa-prompt-dismiss-count";

declare global {
  interface Window {
    triggerPWAInstall?: () => void;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);

    // Enregistrement du service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Échec enregistrement SW:", err);
      });
    }

    // Vérifier si l'app est déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Récupérer le nombre de refus stocké
    const count = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || "0", 10);
    setDismissCount(count);

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      if (count < MAX_PROMPT_COUNT) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Enregistrer la méthode d'installation directe accessible globalement
    window.triggerPWAInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        const link = document.createElement("a");
        link.href = "/setup/installer-station.bat";
        link.download = "Installer-TotalEnergies-Station.bat";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    // Écouter l'installation réussie
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem(DISMISS_COUNT_KEY, MAX_PROMPT_COUNT.toString());
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setShowPrompt(false);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Déclenchement de l'installateur setup
      const link = document.createElement("a");
      link.href = "/setup/installer-station.bat";
      link.download = "Installer-TotalEnergies-Station.bat";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    localStorage.setItem(DISMISS_COUNT_KEY, newCount.toString());
  };

  // Ne pas afficher pendant l'hydratation ou si conditions non remplies
  if (!isMounted || isInstalled || !showPrompt || dismissCount >= MAX_PROMPT_COUNT) {
    return null;
  }

  const remainingTries = MAX_PROMPT_COUNT - dismissCount;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border-2 border-red-500/50 p-4 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <img
              src="/icons/icon-72x72.png"
              alt="Logo TotalEnergies"
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-xs uppercase tracking-wide">
                TotalEnergies Station
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950 text-red-400 border border-red-800">
                Rappel ({dismissCount + 1}/{MAX_PROMPT_COUNT})
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Installez l'application pour un accès rapide, direct et sécurisé hors-ligne.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-red-950/50 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Installer
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Plus tard {remainingTries > 1 && `(${remainingTries - 1} rappel${remainingTries - 1 > 1 ? "s" : ""})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
