"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && registration.waiting) {
                setWaitingWorker(registration.waiting);
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = async () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdate(false);
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border-2 border-amber-500/50 p-4 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-white text-xs uppercase tracking-wide text-amber-400">
              Nouvelle version disponible
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Une mise à jour système est disponible. Rafraîchissez pour activer les dernières fonctionnalités.
            </p>
            <button
              onClick={handleUpdate}
              className="mt-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-amber-950/50 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Mettre à jour maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
