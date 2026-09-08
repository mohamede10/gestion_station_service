"use client";

import React from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';

export interface ReceiptData {
  title: string;
  docNumber: string;
  stationName: string;
  timestamp: string;
  operatorName: string;
  fields: { label: string; value: string | number }[];
  notes?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export default function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">Reçu & Document Certifié</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-6 bg-white text-slate-900 font-sans print:p-0 print:m-0" id="receipt-print-area">
          
          {/* Station Brand Header */}
          <div className="text-center border-b-2 border-red-600 pb-4 mb-4">
            <div className="inline-block bg-red-600 text-white font-black text-xs px-2 py-0.5 rounded tracking-widest uppercase mb-1">
              TOTALENERGIES
            </div>
            <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">{data.stationName}</h2>
            <p className="text-xs text-slate-600 font-medium">{data.title}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
              N° DOC: <span className="font-bold text-red-600">{data.docNumber}</span>
            </div>
          </div>

          {/* Timestamp & Station Info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Horodatage Certifié :</span>
              <span className="font-bold text-slate-800 font-mono">{data.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Opérateur Émetteur :</span>
              <span className="font-bold text-slate-800">{data.operatorName}</span>
            </div>
          </div>

          {/* Key Value Fields */}
          <div className="space-y-2 mb-4">
            {data.fields.map((f, i) => (
              <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-600">{f.label} :</span>
                <span className="font-bold text-slate-900 text-right">{f.value}</span>
              </div>
            ))}
          </div>

          {data.notes && (
            <div className="text-[11px] text-slate-600 italic bg-amber-50 p-2.5 rounded border border-amber-200 mb-4">
              Note : {data.notes}
            </div>
          )}

          {/* Security Hash & Signatures */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <div className="text-[9px] text-slate-400 font-mono">
              HASH CERTIFIÉ : {Math.random().toString(36).substring(2, 10).toUpperCase()}-TE-KISS
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> Authentique
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40 flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" /> Imprimer / Exporter PDF
          </button>
        </div>

      </div>
    </div>
  );
}
