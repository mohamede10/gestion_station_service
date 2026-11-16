"use client";

import React from 'react';
import { useStation } from '@/context/StationContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X,
  HelpCircle
} from 'lucide-react';

export default function SystemAlertContainer() {
  const { alerts, removeAlert, confirmModal, closeConfirm } = useStation();

  return (
    <>
      {/* ─── TOAST NOTIFICATIONS (TOP RIGHT) ─────────────────────────────── */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {alerts.map((alt) => {
          const isSuccess = alt.type === 'success';
          const isError = alt.type === 'error';
          const isWarning = alt.type === 'warning';
          const isInfo = alt.type === 'info' || !alt.type;

          return (
            <div
              key={alt.id}
              className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in flex items-start gap-3 ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
                  : isError
                  ? 'bg-red-950/90 border-red-500/50 text-red-100 shadow-red-950/50'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/50'
                  : 'bg-slate-900/95 border-blue-500/50 text-slate-100 shadow-blue-950/50'
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {isInfo && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                {alt.title && (
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-0.5 text-white">
                    {alt.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed font-medium whitespace-pre-line">
                  {alt.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeAlert(alt.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ─── IN-APP CONFIRMATION MODAL ─────────────────────────────────────── */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {confirmModal.title || 'Confirmation Requise'}
                </h3>
                <p className="text-xs text-slate-400 font-medium">Système de Validation Interne</p>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onCancel) confirmModal.onCancel();
                  closeConfirm();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                {confirmModal.cancelLabel || 'Annuler'}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirm();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-lg shadow-red-950/50 transition"
              >
                {confirmModal.confirmLabel || "Confirmer l'Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
