"use client";

import React, { useState } from 'react';
import { useStation } from '@/context/StationContext';
import { 
  CreditCard, 
  Search, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Wallet, 
  UserPlus, 
  PlusCircle, 
  History,
  Fuel
} from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/ReceiptModal';

export default function AbonnesPage() {
  const { 
    currentStation, 
    stations,
    userRole,
    subscribers, 
    payments, 
    addSubscriber, 
    recordSubscriberPayment, 
    recordSubscriberVoucher,
    notifySuccess,
    notifyError,
    generateSubscriberCode,
    generateVoucherNumber
  } = useStation();

  const isGlobal = !currentStation;
  const filteredSubscribers = isGlobal ? subscribers : subscribers.filter(s => s.stationId === currentStation.id);
  const filteredPayments = isGlobal ? payments : payments.filter(p => p.stationId === currentStation.id);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'PAYMENT' | 'VOUCHER' | 'NEW_SUB' | 'HISTORY'>('PAYMENT');

  // Versement Form State (Nom + Numéro de Compte obligatoire)
  const [selectedSubId, setSelectedSubId] = useState<string>(filteredSubscribers[0]?.id || '');
  const [payerName, setPayerName] = useState<string>('Sékou Camara');
  const [accountNumber, setAccountNumber] = useState<string>('GN012 00100 00458912301 44');
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHECK' | 'CASH'>('BANK_TRANSFER');
  const [amountInput, setAmountInput] = useState<string>('2000000');
  const [refNoInput, setRefNoInput] = useState<string>('VIR-2026-0906');
  const [notesInput, setNotesInput] = useState<string>('Acompte versement sur compte flotte');

  // Bon Carburant à Crédit Form State (N° Bon Client généré automatiquement)
  const [voucherSubId, setVoucherSubId] = useState<string>(filteredSubscribers[0]?.id || '');
  const [fuelType, setFuelType] = useState<'ESSENCE' | 'GAZOIL'>('ESSENCE');
  const [voucherLiters, setVoucherLiters] = useState<string>('100');
  const [voucherPlate, setVoucherPlate] = useState<string>('RC-8812-C');
  const [voucherDriver, setVoucherDriver] = useState<string>('Ibrahima Diallo');
  const [voucherNumber, setVoucherNumber] = useState<string>(generateVoucherNumber());

  // Nouvel Abonné Form State (Code Client généré automatiquement)
  const [newCode, setNewCode] = useState<string>(generateSubscriberCode());
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('+224 ');
  const [newAddress, setNewAddress] = useState<string>('Conakry');
  const [newInitialAdvance, setNewInitialAdvance] = useState<string>('0');
  // Sélecteur de station pour le Super Admin
  const [newSubStation, setNewSubStation] = useState<string>(currentStation?.id || stations[0]?.id || '');

  // Synchronisation dynamique des codes automatiques
  React.useEffect(() => {
    setNewCode(generateSubscriberCode());
  }, [subscribers.length]);

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Handle Payment Submit
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) return;

    try {
      const { receipt } = recordSubscriberPayment({
        subscriberId: selectedSubId,
        payerName,
        accountNumber,
        paymentMethod,
        referenceNo: refNoInput,
        amount: parseFloat(amountInput) || 0,
        notes: notesInput
      });
      setReceiptData(receipt);
      setReceiptModalOpen(true);
      setRefNoInput('REF-' + Math.floor(10000 + Math.random() * 90000));
      notifySuccess(`Versement de ${(parseFloat(amountInput) || 0).toLocaleString('fr-FR')} GNF enregistré avec succès !`);
    } catch (err: any) {
      notifyError(err.message || 'Erreur lors du versement');
    }
  };

  // Handle Voucher Submit
  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherSubId) return;

    try {
      const { receipt } = recordSubscriberVoucher({
        subscriberId: voucherSubId,
        fuelType,
        liters: parseFloat(voucherLiters) || 0,
        unitPrice: 12000,
        vehiclePlate: voucherPlate,
        driverName: voucherDriver,
        voucherNo: voucherNumber
      });
      setReceiptData(receipt);
      setReceiptModalOpen(true);
      notifySuccess(`Bon Carburant "${voucherNumber}" validé avec succès (${voucherLiters} L) !`);
      setVoucherNumber(generateVoucherNumber());
    } catch (err: any) {
      notifyError(err.message || 'Erreur lors de l\'enregistrement du bon');
    }
  };

  // Handle Create New Subscriber
  const handleCreateSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const targetStationId = isGlobal ? newSubStation : currentStation?.id;

    const sub = addSubscriber({
      code: newCode,
      name: newName,
      phone: newPhone,
      address: newAddress,
      stationId: targetStationId || undefined,
      initialAdvance: parseFloat(newInitialAdvance) || 0,
      initialCredit: 0
    });

    notifySuccess(`Client / Abonné "${sub.name}" (${sub.code}) enregistré avec succès !`);
    setNewName('');
    setActiveTab('PAYMENT');
  };

  const filtered = filteredSubscribers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  const totalCredit = filteredSubscribers.reduce((a, b) => a + b.currentCredit, 0);
  const totalAdvance = filteredSubscribers.reduce((a, b) => a + b.currentAdvance, 0);
  const netDue = totalCredit - totalAdvance;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" /> MODULE ABONNÉS, FLOTTES & FACTURATION
          </div>
          <h1  className="text-2xl font-black text-white">Gestion des Abonnés & Versements Certifiés</h1>
          <p className="text-xs text-slate-400 mt-1">
            Suivi des comptes clients, bons carburant, saisie obligatoire (Nom Déposant + N° Compte) et facturation officielle.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('PAYMENT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'PAYMENT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Saisie Versement
          </button>
          <button
            onClick={() => setActiveTab('VOUCHER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'VOUCHER' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Bon Carburant
          </button>
          <button
            onClick={() => setActiveTab('NEW_SUB')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'NEW_SUB' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            + Nouvel Abonné
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'HISTORY' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Historique Récépissés
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Total Consommations à Crédit</span>
          <div className="text-2xl font-black text-red-400 mt-1">
            {totalCredit.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Cumul des bons servis</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Total Acomptes & Avances Versés</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {totalAdvance.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Dépôts disponibles</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Reste Net à Recouvrer (Solde Dû)</span>
          <div className={`text-2xl font-black mt-1 ${netDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {netDue.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Créances nettes clients</span>
        </div>
      </div>

      {/* Main Grid: Forms & Subscriber Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB 1: Saisie Versement */}
        {activeTab === 'PAYMENT' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-base">Enregistrer un Versement Client</h3>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sélectionner l'Abonné :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-emerald-500"
                  value={selectedSubId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    setSelectedSubId(sId);
                    const sub = filteredSubscribers.find(s => s.id === sId);
                    if (sub) setPayerName(sub.name);
                  }}
                >
                  {filteredSubscribers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - Reste: {(s.currentCredit - s.currentAdvance).toLocaleString('fr-FR')} GNF
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-red-400 font-extrabold mb-1 flex items-center justify-between">
                  <span>Nom du Déposant / Payeur *</span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded">Obligatoire</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-red-900/80 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-red-500"
                  placeholder="ex: Mory Keita (Comptable)"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-red-400 font-extrabold mb-1 flex items-center justify-between">
                  <span>Numéro de Compte / RIB / OM / Momo *</span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded">Obligatoire</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-red-900/80 rounded-xl px-3 py-2.5 text-amber-400 font-mono font-bold outline-none focus:border-red-500"
                  placeholder="ex: GN012 00100 00458912301 44 ou 621..."
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mode de Règlement :</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-emerald-500"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="MOBILE_MONEY">Mobile Money (OM/MTN)</option>
                    <option value="CHECK">Chèque Bancaire</option>
                    <option value="CASH">Espèces en Caisse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Montant Versé (GNF) :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="ex: 2000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                    value={amountInput}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">N° Référence / N° Chèque :</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                  value={refNoInput}
                  onChange={(e) => setRefNoInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Motif / Note de versement :</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Enregistrer Versement & Imprimer Récépissé
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Bon Carburant à Crédit */}
        {activeTab === 'VOUCHER' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Fuel className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-white text-base">Prise de Carburant sur Bon (Crédit)</h3>
            </div>

            <form onSubmit={handleSaveVoucher} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sélectionner l'Abonné :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-blue-500"
                  value={voucherSubId}
                  onChange={(e) => setVoucherSubId(e.target.value)}
                >
                  {filteredSubscribers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Carburant :</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-blue-500"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as any)}
                  >
                    <option value="ESSENCE">ESSENCE</option>
                    <option value="GAZOIL">GAZOIL (Diesel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Litres Servis :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="ex: 100"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold outline-none focus:border-blue-500"
                    value={voucherLiters}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setVoucherLiters(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center justify-between">
                    <span>N° Bon Client :</span>
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded-full">Auto-attribué</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    className="w-full bg-slate-950/80 border border-blue-500/30 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold outline-none cursor-not-allowed"
                    value={voucherNumber}
                    title="Attribué automatiquement par le système"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plaque Véhicule :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    value={voucherPlate}
                    onChange={(e) => setVoucherPlate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nom du Chauffeur Bénéficiaire :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  value={voucherDriver}
                  onChange={(e) => setVoucherDriver(e.target.value)}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Prix Unitaire :</span>
                  <span className="font-mono text-slate-300">12 000 GNF / L</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 text-sm font-black">
                  <span className="text-slate-300">Montant Porté au Crédit :</span>
                  <span className="text-blue-400">{((parseFloat(voucherLiters) || 0) * 12000).toLocaleString('fr-FR')} GNF</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Valider Prise Carburant & Imprimer Bon
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: Nouvel Abonné */}
        {activeTab === 'NEW_SUB' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-white text-base">Créer un Nouveau Compte Abonné</h3>
            </div>

            <form onSubmit={handleCreateSubscriber} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center justify-between">
                  <span>Code Client :</span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">Attribué automatiquement</span>
                </label>
                <input
                  type="text"
                  required
                  readOnly
                  className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold outline-none cursor-not-allowed"
                  value={newCode}
                  title="Attribué automatiquement par le système"
                />
              </div>

              {/* Sélecteur de station pour Super Admin en vue globale */}
              {isGlobal && userRole === 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Station d'affectation :</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold outline-none focus:border-amber-500"
                    value={newSubStation}
                    onChange={(e) => setNewSubStation(e.target.value)}
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Raison Sociale / Nom du Client :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: SOCIETE KANKAN LOGISTIQUE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-amber-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Téléphone de Contact :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Adresse / Siège :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Acompte / Dépôt de garantie initial (GNF) :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="ex: 0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold outline-none focus:border-amber-500"
                  value={newInitialAdvance}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setNewInitialAdvance(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" /> Enregistrer le Nouvel Abonné
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: Historique des Récépissés de Versement */}
        {activeTab === 'HISTORY' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Versements Encaissés ({filteredPayments.length})
              </h3>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[450px]">
              {filteredPayments.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-white">{p.subscriberName || 'Abonné'}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">{p.timestamp}</span>
                    </div>
                    <span className="font-black text-emerald-400 font-mono">
                      +{p.amount.toLocaleString('fr-FR')} GNF
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <div>Déposant : <strong className="text-slate-200">{p.payerName}</strong></div>
                    <div className="font-mono text-amber-300">N° Compte : {p.accountNumber}</div>
                    <div>Mode : <span className="font-semibold text-slate-300">{p.paymentMethod}</span> ({p.referenceNo})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directory List of Subscribers (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              Répertoire des Abonnés & Situation des Soldes ({filtered.length})
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par nom, code..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white outline-none focus:border-blue-500 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((sub) => {
              const due = sub.currentCredit - sub.currentAdvance;

              return (
                <div key={sub.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{sub.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800/60">
                        {sub.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span>Tél: <strong className="text-slate-200">{sub.phone}</strong></span>
                      <span>Adresse: <strong className="text-slate-200">{sub.address}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-slate-400">Crédits: <span className="text-red-400 font-bold">{sub.currentCredit.toLocaleString('fr-FR')} GNF</span></div>
                      <div className="text-slate-400">Acomptes: <span className="text-emerald-400 font-bold">{sub.currentAdvance.toLocaleString('fr-FR')} GNF</span></div>
                      <div className={`font-black text-sm mt-1 ${due > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        Reste dû : {due > 0 ? `+${due.toLocaleString('fr-FR')} GNF` : `${due.toLocaleString('fr-FR')} GNF`}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const docNo = `FACT-${Math.floor(1000 + Math.random() * 9000)}`;
                        setReceiptData({
                          title: 'FACTURE OFFICIELLE CERTIFIÉE ABONNÉ (CARBURANTS & FLOTTE)',
                          docNumber: docNo,
                          stationName: currentStation ? currentStation.name : 'TotalEnergies Kissosso',
                          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                          operatorName: 'Direction de la Station',
                          fields: [
                            { label: 'Client Facturé', value: `${sub.name} (${sub.code})` },
                            { label: 'Téléphone & Contact', value: sub.phone },
                            { label: 'Adresse / Siège Client', value: sub.address },
                            { label: 'Cumul Bons Carburants Servis', value: `${sub.currentCredit.toLocaleString('fr-FR')} GNF` },
                            { label: 'Total Avances & Règlements Reçus', value: `${sub.currentAdvance.toLocaleString('fr-FR')} GNF` },
                            { label: 'SOLDE NET RESTANT À RECOUVRER', value: `${due.toLocaleString('fr-FR')} GNF` }
                          ],
                          notes: 'Arrêté de compte et facture certifiée conforme. Date d\'échéance : à réception de facture.'
                        });
                        setReceiptModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition shrink-0"
                    >
                      <FileText className="w-4 h-4 text-blue-400" /> Facture PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Certified Receipt & Invoice Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={receiptData}
      />

    </div>
  );
}
