"use client";

import React, { useState } from 'react';
import { useStation } from '@/context/StationContext';
import { 
  Receipt, 
  ShieldCheck, 
  Zap, 
  Fuel, 
  Phone, 
  Bus, 
  Wrench, 
  Package, 
  FileText, 
  Building, 
  ArrowDownRight, 
  ArrowUpRight, 
  Coins,
  History
} from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/ReceiptModal';

export default function CaissePage() {
  const { 
    currentStation, 
    expenses, 
    payments, 
    pumpShifts, 
    addExpense, 
    recordBankDeposit,
    notifySuccess,
    notifyError,
    notifyWarning
  } = useStation();

  const isGlobal = !currentStation;
  const filteredExpenses = isGlobal ? expenses : expenses.filter(e => e.stationId === currentStation.id);
  const filteredPayments = isGlobal ? payments : payments.filter(p => p.stationId === currentStation.id);
  const filteredShifts = isGlobal ? pumpShifts : pumpShifts.filter(s => s.stationId === currentStation.id);

  // Tab State: 'EXPENSE' | 'BANK_DEPOSIT' | 'JOURNAL'
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'BANK_DEPOSIT' | 'JOURNAL'>('EXPENSE');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Expense Form State
  const [category, setCategory] = useState<'EDG' | 'GROUPE_ELECTROGENE' | 'TELEPHONE_INTERNET' | 'TRANSPORT' | 'ENTRETIEN_REPARATIONS' | 'FOURNITURES' | 'DIVERS'>('EDG');
  const [amount, setAmount] = useState<string>('350000');
  const [beneficiary, setBeneficiary] = useState<string>('Électricité de Guinée (EDG)');
  const [notes, setNotes] = useState<string>('Facture électricité du mois de la station');

  // Bank Deposit Form State (Nom + Numéro de Compte Obligatoire)
  const [depositAmount, setDepositAmount] = useState<string>('25000000');
  const [bankName, setBankName] = useState<string>('Ecobank Guinée (Agence Matoto)');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('GN012 00100 00458912301 44');
  const [depositorName, setDepositorName] = useState<string>('Sidiki Souaré (CDS)');
  const [slipNumber, setSlipNumber] = useState<string>('BORD-' + Math.floor(10000 + Math.random() * 90000));
  const [depositNotes, setDepositNotes] = useState<string>('Versement des recettes pompes du week-end');

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Totals Calculation
  const totalPumpRevenue = filteredShifts.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalPumpCash = filteredShifts.reduce((acc, s) => acc + (s.cashAmount !== undefined ? s.cashAmount : (s.totalAmount - (s.creditedAmount || 0))), 0);
  const totalSubscriberPayments = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalCashIn = totalPumpCash + totalSubscriberPayments;

  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const currentCashBalance = totalCashIn - totalExpenses;

  // Handlers
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { receipt } = addExpense({
        category,
        amount: parseFloat(amount) || 0,
        beneficiary,
        notes
      });
      setReceiptData(receipt);
      setReceiptModalOpen(true);
    } catch (err: any) {
      notifyError(err.message || 'Erreur lors de l\'enregistrement de la dépense');
    }
  };

  const handleSaveBankDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositorName.trim() || !bankAccountNumber.trim()) {
      notifyWarning('Le Nom du Déposant et le Numéro de Compte de la Station sont obligatoires !');
      return;
    }

    try {
      const { receipt } = recordBankDeposit({
        amount: parseFloat(depositAmount) || 0,
        bankName,
        accountNumber: bankAccountNumber,
        depositorName,
        slipNumber,
        notes: depositNotes
      });
      setReceiptData(receipt);
      setReceiptModalOpen(true);
      setSlipNumber('BORD-' + Math.floor(10000 + Math.random() * 90000));
    } catch (err: any) {
      notifyError(err.message || 'Erreur lors du versement bancaire');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'EDG': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'GROUPE_ELECTROGENE': return <Fuel className="w-4 h-4 text-red-400" />;
      case 'TELEPHONE_INTERNET': return <Phone className="w-4 h-4 text-blue-400" />;
      case 'TRANSPORT': return <Bus className="w-4 h-4 text-emerald-400" />;
      case 'ENTRETIEN_REPARATIONS': return <Wrench className="w-4 h-4 text-orange-400" />;
      case 'FOURNITURES': return <Package className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredExpensesList = filterCategory === 'ALL'
    ? filteredExpenses
    : filteredExpenses.filter(e => e.category === filterCategory);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" /> MODULE GESTION DE CAISSE, DÉPENSES & VERSEMENTS
          </div>
          <h2 className="text-2xl font-black text-white">Journal de Trésorerie, Dépenses & Dépôts Bancaires</h2>
          <p className="text-xs text-slate-400 mt-1">
            Suivi des flux : Entrées (Recettes pompes, versements abonnés), Sorties ventilées (EDG, Groupe, etc.) et Dépôts bancaires.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('EXPENSE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'EXPENSE' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Sortie de Caisse
          </button>
          <button
            onClick={() => setActiveTab('BANK_DEPOSIT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'BANK_DEPOSIT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Versement Banque
          </button>
          <button
            onClick={() => setActiveTab('JOURNAL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'JOURNAL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Grand Livre
          </button>
        </div>
      </div>

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Recettes Encaissées (Entrées)</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            +{totalCashIn.toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-bold">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Espèces Pompes ({totalPumpCash.toLocaleString('fr-FR')}) + Règlements Abonnés</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Dépenses & Versements (Sorties)</span>
            <ArrowUpRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 mt-2">
            -{totalExpenses.toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-bold">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Charges d'exploitation & Dépôts banque</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Solde Net Théorique en Caisse</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-black mt-2 ${currentCashBalance >= 0 ? 'text-amber-400' : 'text-red-500'}`}>
            {currentCashBalance.toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-bold">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Espèces disponibles sous coffre</span>
        </div>
      </div>

      {/* Form and History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column */}
        {activeTab === 'EXPENSE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Receipt className="w-5 h-5 text-red-400" />
              <h3 className="font-extrabold text-white text-base">Nouvelle Sortie de Caisse</h3>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Catégorie de Dépense :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-red-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="EDG">Électricité EDG (Électricité de Guinée)</option>
                  <option value="GROUPE_ELECTROGENE">Groupe Électrogène (Carburant / Entretien)</option>
                  <option value="TELEPHONE_INTERNET">Téléphone & Internet Station</option>
                  <option value="TRANSPORT">Transport & Coursiers</option>
                  <option value="ENTRETIEN_REPARATIONS">Entretien, Réparations & Maintenance</option>
                  <option value="FOURNITURES">Fournitures de Bureau & Rouleaux Caisse</option>
                  <option value="DIVERS">Divers / Menues Dépenses</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Bénéficiaire / Prestataire :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: EDG Guinée, Station Carbu, Papeterie..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-red-500"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Montant Décaissé (GNF) :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="ex: 350000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-red-400 font-mono font-bold text-sm outline-none focus:border-red-500"
                  value={amount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Motif / Justification Dépense :</label>
                <textarea
                  rows={2}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-red-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Décaissement Caisse & Imprimer Bon
              </button>
            </form>
          </div>
        )}

        {/* Bank Deposit Column */}
        {activeTab === 'BANK_DEPOSIT' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-white text-base">Versement Bancaire des Recettes</h3>
            </div>

            <form onSubmit={handleSaveBankDeposit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-blue-400 font-extrabold mb-1">Banque Réceptrice :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-blue-900/60 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-red-400 font-extrabold mb-1 flex items-center justify-between">
                  <span>Numéro de Compte Station *</span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1 rounded">Requis</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-red-900/80 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold outline-none focus:border-red-500"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-red-400 font-extrabold mb-1 flex items-center justify-between">
                  <span>Nom du Déposant / Convoyeur *</span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1 rounded">Requis</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-red-900/80 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-red-500"
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">N° Bordereau Banque :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold outline-none focus:border-blue-500"
                    value={slipNumber}
                    onChange={(e) => setSlipNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Montant Versé (GNF) :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="ex: 25000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold outline-none focus:border-blue-500"
                    value={depositAmount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Notes / Référence :</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Enregistrer Versement & Imprimer Bordereau
              </button>
            </form>
          </div>
        )}

        {/* Expenses List & Audit Trail (2 Cols) */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 ${activeTab === 'JOURNAL' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              Journal des Dépenses & Pièces Justificatives ({filteredExpensesList.length})
            </h3>

            {/* Filter by Category */}
            <select
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="EDG">EDG</option>
              <option value="GROUPE_ELECTROGENE">Groupe électrogène</option>
              <option value="TELEPHONE_INTERNET">Téléphone & Internet</option>
              <option value="TRANSPORT">Transport</option>
              <option value="ENTRETIEN_REPARATIONS">Entretien & Maintenance</option>
              <option value="FOURNITURES">Fournitures</option>
              <option value="DIVERS">Divers / Banques</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredExpensesList.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{exp.beneficiary}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.category}
                      </span>
                    </div>
                    <div className="text-slate-400 mt-0.5">{exp.notes}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Horodatage certifié : {exp.timestamp}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-sm text-red-400">
                    -{exp.amount.toLocaleString('fr-FR')} GNF
                  </div>
                  <button
                    onClick={() => {
                      const docNo = `BON-${Math.floor(1000 + Math.random() * 9000)}`;
                      setReceiptData({
                        title: 'BON OFFICIEL DE DÉCAISSEMENT CERTIFIÉ',
                        docNumber: docNo,
                        stationName: currentStation ? currentStation.name : 'TotalEnergies Kissosso',
                        timestamp: exp.timestamp,
                        operatorName: 'Direction / Caisse Station',
                        fields: [
                          { label: 'Catégorie Dépense', value: exp.category },
                          { label: 'Bénéficiaire', value: exp.beneficiary },
                          { label: 'Montant Décaissé', value: `${exp.amount.toLocaleString('fr-FR')} GNF` },
                          { label: 'Justification & Motif', value: exp.notes }
                        ],
                        notes: 'Dépense engagée conformément au budget d\'exploitation approuvé.'
                      });
                      setReceiptModalOpen(true);
                    }}
                    className="mt-1 text-[11px] font-bold text-slate-400 hover:text-white underline block"
                  >
                    Voir Bon PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Certified Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={receiptData}
      />

    </div>
  );
}
