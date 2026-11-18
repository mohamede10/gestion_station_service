"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStation } from '@/context/StationContext';
import { 
  Fuel, 
  Droplets, 
  AlertTriangle, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Truck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History,
  TrendingDown,
  Radio
} from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/ReceiptModal';
import { formatFuelName } from '@/lib/data-mock';

export default function CarburantsPage() {
  const { 
    currentStation, 
    tanks, 
    pumps, 
    deliveries, 
    pumpShifts, 
    recordPumpShift, 
    recordTankDipstick, 
    recordFuelDelivery,
    notifySuccess,
    notifyError,
    generateDeliveryNoteNumber,
    employees
  } = useStation();

  const isGlobal = !currentStation;
  const filteredTanks = isGlobal ? tanks : tanks.filter(t => t.stationId === currentStation.id);
  const filteredPumps = isGlobal ? pumps : pumps.filter(p => p.stationId === currentStation.id);
  const filteredDeliveries = isGlobal ? deliveries : deliveries.filter(d => d.stationId === currentStation.id);
  const filteredShifts = isGlobal ? pumpShifts : pumpShifts.filter(s => s.stationId === currentStation.id);
  const stationEmployees = isGlobal ? employees : employees.filter(e => e.stationId === currentStation.id);
  // Pompistes de la station sélectionnée (ou tous les employés de la station si aucun avec le titre exact)
  const stationPompistes = stationEmployees.filter(e => 
    e.jobTitle.toLowerCase().includes('pompiste') || 
    e.jobTitle.toLowerCase().includes('chef') ||
    e.jobTitle.toLowerCase().includes('piste')
  );
  const availablePompistes = stationPompistes.length > 0 ? stationPompistes : stationEmployees;

  // Active Tab: 'SHIFT' | 'DELIVERY' | 'DIPSTICK' | 'HISTORY'
  const [activeTab, setActiveTab] = useState<'SHIFT' | 'DELIVERY' | 'DIPSTICK' | 'HISTORY'>('SHIFT');

  // Form State: Saisie Pompiste
  const [selectedPumpId, setSelectedPumpId] = useState<string>(filteredPumps[0]?.id || '');
  const [startIndexInput, setStartIndexInput] = useState<string>(String(filteredPumps[0]?.startIndex || 0));
  const [endIndexInput, setEndIndexInput] = useState<string>(String(filteredPumps[0]?.endIndex || 0));
  const [returnToTankInput, setReturnToTankInput] = useState<string>('0');
  const [pompisteName, setPompisteName] = useState<string>('Laye Souaré');
  const [shiftType, setShiftType] = useState<'MATIN' | 'SOIR' | 'NUIT'>('MATIN');

  // Form State: Jaugeage
  const [selectedTankId, setSelectedTankId] = useState<string>(filteredTanks[0]?.id || '');
  const [physicalStockInput, setPhysicalStockInput] = useState<string>(String(filteredTanks[0]?.physicalStock || 0));
  const [dipOperator, setDipOperator] = useState<string>('Mory Diawara (CDP)');

  // Form State: Réception Citerne (N° BL auto-attribué par le système)
  const [deliveryTankId, setDeliveryTankId] = useState<string>(filteredTanks[0]?.id || '');
  const [deliveryNoteNo, setDeliveryNoteNo] = useState<string>(generateDeliveryNoteNumber());
  const [truckPlate, setTruckPlate] = useState<string>('RC-4412-D (Citerne 45T)');
  const [driverName, setDriverName] = useState<string>('Mohamed Camara');
  const [supplier, setSupplier] = useState<string>('TotalEnergies Guinée - Dépôt Coronthie');
  const [litersDelivered, setLitersDelivered] = useState<string>('20000');
  const [deliveryOperator, setDeliveryOperator] = useState<string>('Sidiki Souaré (CDS)');

  // Synchronisation dynamique du pompiste responsable avec la liste de la station
  React.useEffect(() => {
    if (availablePompistes.length > 0) {
      // Si le nom actuel n'est pas dans la liste des pompistes disponibles, on prend le premier
      const exists = availablePompistes.some(p => p.fullName === pompisteName);
      if (!exists) {
        setPompisteName(availablePompistes[0].fullName);
      }
    }
  }, [availablePompistes, pompisteName]);

  // Synchronisation dynamique du N° de BL
  React.useEffect(() => {
    setDeliveryNoteNo(generateDeliveryNoteNumber());
  }, [deliveries.length]);

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Handlers
  const handleSavePumpReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPumpId) return;

    try {
      const { receipt } = recordPumpShift({
        pumpId: selectedPumpId,
        startIndex: parseFloat(startIndexInput) || 0,
        endIndex: parseFloat(endIndexInput) || 0,
        returnToTank: parseFloat(returnToTankInput) || 0,
        pompisteName,
        shiftType
      });
      setReceiptData(receipt);
      setReceiptModalOpen(true);
      notifySuccess(`Relevé de pompe enregistré avec succès !`);
    } catch (err: any) {
      notifyError(err.message || 'Erreur lors de l\'enregistrement de la tournée');
    }
  };

  const handleSaveDipstick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTankId) return;

    try {
      const { receipt, gap } = recordTankDipstick({
        tankId: selectedTankId,
        physicalStock: parseFloat(physicalStockInput) || 0,
        operatorName: dipOperator
      });
      setReceiptData(receipt);
      setReceiptModalOpen(true);
      notifySuccess(`Jaugeage enregistré avec succès ! Écart : ${gap} L.`);
    } catch (err: any) {
      notifyError(err.message || 'Erreur lors du jaugeage');
    }
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryTankId) return;

    try {
      const { receipt } = recordFuelDelivery({
        tankId: deliveryTankId,
        deliveryNoteNumber: deliveryNoteNo,
        truckPlate,
        driverName,
        supplier,
        litersDelivered: parseFloat(litersDelivered) || 0,
        operatorName: deliveryOperator
      });
      setReceiptData(receipt);
      setReceiptModalOpen(true);
      notifySuccess(`Livraison "${deliveryNoteNo}" de ${(parseFloat(litersDelivered) || 0).toLocaleString('fr-FR')} L enregistrée avec succès !`);
      setDeliveryNoteNo(generateDeliveryNoteNumber());
    } catch (err: any) {
      notifyError(err.message || 'Erreur lors de l\'enregistrement de la livraison');
    }
  };

  // Selected pump info
  const activePump = filteredPumps.find(p => p.id === selectedPumpId) || filteredPumps[0];
  const activeTank = filteredTanks.find(t => t.id === selectedTankId) || filteredTanks[0];

  const startNum = parseFloat(startIndexInput) || 0;
  const endNum = parseFloat(endIndexInput) || 0;
  const returnNum = parseFloat(returnToTankInput) || 0;
  const soldLiters = Math.max(0, endNum - startNum - returnNum);
  const totalAmount = soldLiters * (activePump?.unitPrice || 12000);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
            <Fuel className="w-4 h-4" /> MODULE GESTION CARBURANTS & STOCK TOTALENERGIES
          </div>
          <h2 className="text-2xl font-black text-white">Stock Cuves, Index Pompes, Livraisons & Pertes</h2>
          <p className="text-xs text-slate-400 mt-1">
            Suivi complet du cycle carburant : Stock Départ, Entrant (BL Citerne), Sortant (Index), Restant et Pertes/Écarts.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('SHIFT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'SHIFT' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Tournée Pompes
          </button>
          <button
            onClick={() => setActiveTab('DELIVERY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'DELIVERY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Réception Citerne
          </button>
          <button
            onClick={() => setActiveTab('DIPSTICK')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'DIPSTICK' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Jaugeage & Pertes
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'HISTORY' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Historique & Audit
          </button>
          <Link
            href="/telematics"
            className="px-3 py-1.5 rounded-lg font-bold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition flex items-center gap-1.5 ml-auto text-xs"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-400" />
            <span>Sondes IoT (Ruptela)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </Link>
        </div>
      </div>

      {/* Tank Summary Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTanks.map((tank) => {
          const gap = tank.physicalStock - tank.currentStock;
          const fillPercentage = Math.min(100, Math.round((tank.currentStock / tank.capacity) * 100));

          return (
            <div key={tank.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className={`w-5 h-5 ${(tank.fuelType === 'SUPER' || tank.fuelType === 'ESSENCE') ? 'text-red-500' : 'text-amber-400'}`} />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{tank.code}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{tank.fuelType === 'SUPER' ? 'ESSENCE' : tank.fuelType}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300">
                  {fillPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${(tank.fuelType === 'SUPER' || tank.fuelType === 'ESSENCE') ? 'bg-gradient-to-r from-red-600 to-rose-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`} 
                  style={{ width: `${fillPercentage}%` }}
                ></div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Stock Théorique :</span>
                  <span className="font-bold text-white font-mono">{tank.currentStock.toLocaleString('fr-FR')} L</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stock Jauge Physique :</span>
                  <span className="font-bold text-amber-300 font-mono">{tank.physicalStock.toLocaleString('fr-FR')} L</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Sonde Ruptela :
                  </span>
                  <Link href="/telematics" className="text-[11px] font-bold text-amber-400 font-mono hover:underline flex items-center gap-1">
                    {(tank.sensorLiters || tank.physicalStock).toLocaleString('fr-FR')} L
                    <Radio className="w-3 h-3 text-red-500" />
                  </Link>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/80">
                  <span>Écart Détecté :</span>
                  <span className={`font-black font-mono ${gap < 0 ? 'text-red-400' : (gap > 0 ? 'text-emerald-400' : 'text-slate-300')}`}>
                    {gap > 0 ? `+${gap} L` : `${gap} L`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TAB CONTENT: 1) Saisie Tournée Pompes */}
      {activeTab === 'SHIFT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Fuel className="w-5 h-5 text-red-500" />
              <h3 className="font-extrabold text-white text-base">Saisie de Tournée Pompiste</h3>
            </div>

            <form onSubmit={handleSavePumpReading} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sélectionner la Pompe :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-red-500"
                  value={selectedPumpId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    setSelectedPumpId(pId);
                    const found = filteredPumps.find(p => p.id === pId);
                    if (found) {
                      setStartIndexInput(String(found.startIndex));
                      setEndIndexInput(String(found.endIndex));
                    }
                  }}
                >
                  {filteredPumps.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.fuelType}) - {p.unitPrice.toLocaleString('fr-FR')} GNF/L
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Quart / Tournée :</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-red-500"
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value as any)}
                  >
                    <option value="MATIN">Matin (06h - 14h)</option>
                    <option value="SOIR">Soir (14h - 22h)</option>
                    <option value="NUIT">Nuit (22h - 06h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pompiste Responsable :</label>
                  {availablePompistes.length > 0 ? (
                    <select
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-red-500 cursor-pointer"
                      value={pompisteName}
                      onChange={(e) => setPompisteName(e.target.value)}
                    >
                      {availablePompistes.map((emp) => (
                        <option key={emp.id} value={emp.fullName}>
                          {emp.fullName} ({emp.jobTitle})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Nom du pompiste"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
                      value={pompisteName}
                      onChange={(e) => setPompisteName(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Index Départ :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="ex: 145200"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-red-500"
                    value={startIndexInput}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setStartIndexInput(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Index Arrivée :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="ex: 147800"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-red-500"
                    value={endIndexInput}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEndIndexInput(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Retour en Cuve (Essais / Purges L) :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono outline-none focus:border-red-500"
                  value={returnToTankInput}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setReturnToTankInput(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Volume Net Vendu :</span>
                  <span className="font-bold text-white font-mono">{soldLiters.toLocaleString('fr-FR')} Litres</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Prix Unitaire Réglementé :</span>
                  <span className="font-mono text-slate-300">{activePump?.unitPrice.toLocaleString('fr-FR')} GNF / L</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-800 text-sm font-black">
                  <span className="text-slate-300">Recette Totale à Recouvrer :</span>
                  <span className="text-red-400">{totalAmount.toLocaleString('fr-FR')} GNF</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" /> Valider Tournée & Imprimer Bon Certifié
              </button>
            </form>
          </div>

          {/* Pump Cards & Live Status */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-red-500" />
                  État Actuel des Pompes de la Station ({filteredPumps.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPumps.map((p) => {
                  const pSold = Math.max(0, p.endIndex - p.startIndex - p.returnToTank);
                  const pRev = pSold * p.unitPrice;

                  return (
                    <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-white">{p.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(p.fuelType === 'SUPER' || p.fuelType === 'ESSENCE') ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                          {p.fuelType === 'SUPER' ? 'ESSENCE' : p.fuelType}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Index Début :</span>
                          <span className="font-mono text-slate-300">{p.startIndex.toLocaleString('fr-FR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Index Fin :</span>
                          <span className="font-mono text-slate-300">{p.endIndex.toLocaleString('fr-FR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retour Cuve :</span>
                          <span className="font-mono text-amber-400">{p.returnToTank.toLocaleString('fr-FR')} L</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Ventes : <strong className="text-white">{pSold.toLocaleString('fr-FR')} L</strong></span>
                        <span className="text-xs font-black text-red-400">{pRev.toLocaleString('fr-FR')} GNF</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 2) Réception Citerne / Dépotage */}
      {activeTab === 'DELIVERY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-white text-base">Réception Camion Citerne</h3>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cuve Réceptrice :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-blue-500"
                  value={deliveryTankId}
                  onChange={(e) => setDeliveryTankId(e.target.value)}
                >
                  {filteredTanks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.code} ({t.fuelType}) - Stock Actuel : {t.currentStock.toLocaleString('fr-FR')} L
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center justify-between">
                    <span>N° Bon Livraison (BL) :</span>
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded-full">Auto-attribué</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    className="w-full bg-slate-950/80 border border-blue-500/30 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold outline-none cursor-not-allowed"
                    value={deliveryNoteNo}
                    title="N° de Bon de Livraison attribué automatiquement par le système"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Volume Dépoté (L) :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="ex: 20000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none focus:border-blue-500"
                    value={litersDelivered}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setLitersDelivered(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Immatriculation Citerne :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Chauffeur Livreur :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Dépôt / Fournisseur :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Superviseur Réception (CDS / CDP) :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  value={deliveryOperator}
                  onChange={(e) => setDeliveryOperator(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Valider Réception & Imprimer Certificat BL
              </button>
            </form>
          </div>

          {/* Delivery History */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                Historique des Dépotages Citernes ({filteredDeliveries.length})
              </h3>
            </div>

            <div className="space-y-3">
              {filteredDeliveries.map((del) => (
                <div key={del.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{del.deliveryNoteNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                        {del.tankCode}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Camion : <strong className="text-slate-200">{del.truckPlate}</strong> | Chauffeur : <strong className="text-slate-200">{del.driverName}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {del.timestamp} - Reçu par : {del.operatorName}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-base text-blue-400">
                      +{del.litersDelivered.toLocaleString('fr-FR')} L
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {(del.litersDelivered * 12000).toLocaleString('fr-FR')} GNF
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3) Jaugeage Physique & Écarts */}
      {activeTab === 'DIPSTICK' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Droplets className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-white text-base">Jaugeage Physique & Détection Coulage</h3>
            </div>

            <form onSubmit={handleSaveDipstick} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sélectionner la Cuve :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-amber-500"
                  value={selectedTankId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setSelectedTankId(tId);
                    const found = filteredTanks.find(t => t.id === tId);
                    if (found) setPhysicalStockInput(String(found.physicalStock));
                  }}
                >
                  {filteredTanks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.code} ({t.fuelType}) - Stock Théorique: {t.currentStock.toLocaleString('fr-FR')} L
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Stock Physique Mesuré à la Règle (Litres) :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="ex: 28350"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-amber-400 font-mono font-bold text-base outline-none focus:border-amber-500"
                  value={physicalStockInput}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setPhysicalStockInput(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Opérateur ayant effectué le jaugeage :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-500"
                  value={dipOperator}
                  onChange={(e) => setDipOperator(e.target.value)}
                />
              </div>

              {(() => {
                const tank = activeTank;
                if (!tank) return null;
                const parsedPhysicalStock = parseFloat(physicalStockInput) || 0;
                const gap = parsedPhysicalStock - tank.currentStock;

                return (
                  <div className={`p-4 rounded-xl border ${gap < 0 ? 'bg-red-950/70 border-red-800 text-red-300' : 'bg-emerald-950/70 border-emerald-800 text-emerald-300'}`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {gap < 0 ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      <span className="text-sm">
                        {gap < 0 
                          ? `PERTE DÉTECTÉE : ${Math.abs(gap).toLocaleString('fr-FR')} L (${Math.abs(gap * 12000).toLocaleString('fr-FR')} GNF)` 
                          : (gap > 0 ? `EXCÉDENT DÉTECTÉ : +${gap.toLocaleString('fr-FR')} L` : 'STOCK PARFAITEMENT CONFORME (0 Litre d\'écart)')}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mt-2">
                      Théorique Système : <strong>{tank.currentStock.toLocaleString('fr-FR')} L</strong> | Règle Physique : <strong>{parsedPhysicalStock.toLocaleString('fr-FR')} L</strong>
                    </p>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Enregistrer Jaugeage & Éditer Certificat d'Écart
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Comprendre la Gestion des Pertes & Coulage
            </h3>
            
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">1. Stock Théorique (Système)</span>
                Formule : <code className="text-amber-400 font-mono">Stock Départ + Livraisons Entrantes - Ventes Pompes</code>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">2. Stock Physique (Règle graduée)</span>
                Mesuré quotidiennement matin et soir au moyen de la canne de jaugeage trempée dans chaque cuve.
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">3. Analyse d'Écart</span>
                Si le stock physique est inférieur au stock théorique, le système génère automatiquement une alerte coulage et enregistre un certificat d'écart pour audit.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 4) Historique & Audit */}
      {activeTab === 'HISTORY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <History className="w-5 h-5 text-red-500" />
              Journal des Tournées Pompes & Saisies Enregistrées ({filteredShifts.length})
            </h3>
          </div>

          <div className="space-y-2">
            {filteredShifts.map((sh) => (
              <div key={sh.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">{sh.pumpName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {sh.shiftType}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{sh.timestamp}</span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    Pompiste : <strong className="text-slate-200">{sh.pompisteName}</strong> | Index : {sh.startIndex.toLocaleString('fr-FR')} → {sh.endIndex.toLocaleString('fr-FR')} | Retour : {sh.returnToTank} L
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-white">{sh.litersSold.toLocaleString('fr-FR')} Litres</div>
                  <div className="font-black text-red-400">{sh.totalAmount.toLocaleString('fr-FR')} GNF</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certified Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={receiptData}
      />

    </div>
  );
}
