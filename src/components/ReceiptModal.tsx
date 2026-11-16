"use client";

import React, { useEffect } from 'react';
import { X, Printer, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useStation } from '@/context/StationContext';

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
  const { notifyWarning } = useStation();
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenInNewWindow = () => {
    const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/Logo_TotalEnergies.webp` : '/Logo_TotalEnergies.webp';
    const newWindow = window.open('', '_blank', 'width=850,height=950,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');

    if (!newWindow) {
      notifyWarning("Veuillez autoriser les fenêtres pop-up dans votre navigateur pour ouvrir ce document.");
      return;
    }

    const fieldsHtml = data.fields
      .map(
        (f) => `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; font-size: 13px;">${f.label}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a; text-align: right; font-size: 13px;">${f.value}</td>
        </tr>`
      )
      .join('');

    const notesHtml = data.notes
      ? `
      <div style="margin-top: 18px; padding: 12px 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; font-size: 12px; color: #854d0e; font-style: italic;">
        <strong>Note :</strong> ${data.notes}
      </div>`
      : '';

    const certHash = `${Math.random().toString(36).substring(2, 10).toUpperCase()}-TE-${(data.stationName || 'STA').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${data.title} - ${data.docNumber} | TotalEnergies</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 24px 16px;
    }
    .toolbar {
      max-width: 720px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .toolbar-title {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      cursor: pointer;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-print {
      background-color: #e2001a;
      color: white;
    }
    .btn-print:hover {
      background-color: #b80015;
    }
    .btn-close {
      background-color: #334155;
      color: #f1f5f9;
    }
    .btn-close:hover {
      background-color: #475569;
    }
    .document-card {
      max-width: 720px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 40px;
      border-radius: 14px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .logo-box {
      text-align: center;
      margin-bottom: 12px;
    }
    .logo-img {
      height: 60px;
      width: auto;
      object-fit: contain;
      display: inline-block;
    }
    .station-title {
      font-size: 20px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin-top: 6px;
    }
    .doc-type {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
      margin-top: 2px;
    }
    .doc-number-badge {
      display: inline-block;
      margin-top: 10px;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #991b1b;
      padding: 4px 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 12px;
    }
    .meta-item strong {
      display: block;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .meta-item span {
      font-weight: 700;
      color: #1e293b;
    }
    .table-container {
      width: 100%;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      width: 45%;
      text-align: center;
      font-size: 12px;
    }
    .sign-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 50px;
    }
    .sign-line {
      border-top: 1px solid #94a3b8;
      color: #64748b;
      font-size: 11px;
      padding-top: 4px;
    }
    .cert-footer {
      margin-top: 30px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
      font-family: monospace;
    }
    .auth-badge {
      color: #16a34a;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    @media print {
      body {
        background: #fff;
        padding: 0;
      }
      .toolbar {
        display: none !important;
      }
      .document-card {
        box-shadow: none;
        border: none;
        padding: 0;
        max-width: 100%;
      }
      @page {
        margin: 1.5cm;
        size: auto;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      <span>⛽ TotalEnergies — Document Officiel</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-print" onclick="window.print()">🖨️ Imprimer / Exporter PDF</button>
      <button class="btn btn-close" onclick="window.close()">✕ Fermer la page</button>
    </div>
  </div>

  <div class="document-card">
    <div class="logo-box">
      <img src="${logoUrl}" alt="TotalEnergies" class="logo-img" />
      <h1 class="station-title">${data.stationName}</h1>
      <div class="doc-type">${data.title}</div>
      <div class="doc-number-badge">N° ${data.docNumber}</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <strong>Date & Heure d'Émission</strong>
        <span>${data.timestamp}</span>
      </div>
      <div class="meta-item" style="text-align: right;">
        <strong>Opérateur Émetteur</strong>
        <span>${data.operatorName}</span>
      </div>
    </div>

    <div class="table-container">
      <table>
        <tbody>
          ${fieldsHtml}
        </tbody>
      </table>
    </div>

    ${notesHtml}

    <div class="signatures">
      <div class="sign-box">
        <div class="sign-title">Visa & Cachet TotalEnergies</div>
        <div class="sign-line">Direction / Responsable Station</div>
      </div>
      <div class="sign-box">
        <div class="sign-title">Client / Bénéficiaire</div>
        <div class="sign-line">Signature pour acquit</div>
      </div>
    </div>

    <div class="cert-footer">
      <div>CERT-HASH : ${certHash}</div>
      <div class="auth-badge">✓ Document Certifié Authentique</div>
    </div>
  </div>
</body>
</html>`;

    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Modal Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">Document & Facture Certifiée</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleOpenInNewWindow}
              title="Ouvrir dans une nouvelle fenêtre"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Nouvelle Fenêtre</span>
            </button>
            <button
              onClick={onClose}
              title="Fermer la page (Échap)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-6 bg-white text-slate-900 font-sans print:p-0 print:m-0" id="receipt-print-area">
          
          {/* Station Brand Header with Logo TotalEnergies */}
          <div className="text-center border-b-2 border-red-600 pb-4 mb-4">
            <div className="flex justify-center items-center mb-2">
              <img 
                src="/Logo_TotalEnergies.webp" 
                alt="Logo TotalEnergies" 
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm" 
              />
            </div>
            <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">{data.stationName}</h2>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">{data.title}</p>
            <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-mono bg-red-50 text-red-700 px-2.5 py-1 rounded border border-red-200">
              N° DOCUMENT : <span className="font-bold text-red-600">{data.docNumber}</span>
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
          <div className="space-y-1.5 mb-4">
            {data.fields.map((f, i) => (
              <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-600">{f.label} :</span>
                <span className="font-bold text-slate-900 text-right">{f.value}</span>
              </div>
            ))}
          </div>

          {data.notes && (
            <div className="text-[11px] text-slate-700 italic bg-amber-50 p-2.5 rounded border border-amber-200 mb-4">
              <strong>Note :</strong> {data.notes}
            </div>
          )}

          {/* Signatures Areas */}
          <div className="grid grid-cols-2 gap-4 my-4 pt-2 text-[10px] text-slate-500">
            <div className="border-t border-dashed border-slate-300 pt-2 text-center">
              <span className="font-semibold text-slate-700 block mb-6">Pour la Station</span>
              <span className="italic">Cachet & Signature</span>
            </div>
            <div className="border-t border-dashed border-slate-300 pt-2 text-center">
              <span className="font-semibold text-slate-700 block mb-6">Client / Bénéficiaire</span>
              <span className="italic">Signature pour acquit</span>
            </div>
          </div>

          {/* Security Hash & Signatures */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <div className="text-[9px] text-slate-400 font-mono">
              HASH CERTIFIÉ : {Math.random().toString(36).substring(2, 10).toUpperCase()}-TE-KISS
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> Authentique
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 border border-slate-700/60"
          >
            <X className="w-3.5 h-3.5" /> Fermer la page
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInNewWindow}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/50 flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ouvrir en fenêtre
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimer / PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
