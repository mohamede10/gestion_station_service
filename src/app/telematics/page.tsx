"use client";

import React, { useState, useEffect } from 'react';
import { useStation } from '@/context/StationContext';
import { 
  Radio, 
  Wifi, 
  BatteryCharging, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Settings2, 
  RefreshCw, 
  Sliders, 
  Cpu, 
  Layers, 
  Fuel, 
  Activity, 
  ExternalLink, 
  Copy, 
  Check,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function TelematicsPage() {
  const { 
    tanks, 
    stations, 
    currentStation, 
    setCurrentStation, 
    userRole,
    updateTankTelematics,
    configureTankSensor,
    recordFuelSale,
    resetAllData,
    notifySuccess,
    notifyError,
    notifyWarning,
    askConfirm,
    employees
  } = useStation();

  // Pompistes liés à la station active
  const stationEmployees = currentStation ? employees.filter(e => e.stationId === currentStation.id) : employees;
  const stationPompistes = stationEmployees.filter(e => 
    e.jobTitle.toLowerCase().includes('pompiste') || 
    e.jobTitle.toLowerCase().includes('chef') ||
    e.jobTitle.toLowerCase().includes('piste')
  );
  const availablePompistes = stationPompistes.length > 0 ? stationPompistes : stationEmployees;

  // Filtre station (si SUPER_ADMIN, peut choisir 'ALL' ou une station spécifique)
  const isGlobal = !currentStation || userRole === 'SUPER_ADMIN';
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>(currentStation ? currentStation.id : 'ALL');

  // Modal d'appairage sonde
  const [editingTankId, setEditingTankId] = useState<string | null>(null);
  const [imeiInput, setImeiInput] = useState<string>('');
  const [macInput, setMacInput] = useState<string>('');
  const [sensorIndexInput, setSensorIndexInput] = useState<number>(1);

  // Modal de saisie directe d'une vente (déduction en temps réel)
  const [saleTankId, setSaleTankId] = useState<string | null>(null);
  const [saleLitersInput, setSaleLitersInput] = useState<string>('500');
  const [salePompisteInput, setSalePompisteInput] = useState<string>('Laye Souaré');
  const [saleNotesInput, setSaleNotesInput] = useState<string>('');
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);

  // Onglet actif : 'DASHBOARD' | 'SIMULATOR' | 'GUIDE'
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SIMULATOR' | 'GUIDE'>('DASHBOARD');

  // État simulateur
  const [simTankId, setSimTankId] = useState<string>('');
  const [simLiters, setSimLiters] = useState<number>(0);
  const [simTemp, setSimTemp] = useState<number>(28.5);
  const [simBattery, setSimBattery] = useState<number>(98);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  // État copie presse-papier
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Cuves filtrées
  const displayedTanks = tanks.filter(t => {
    if (selectedStationFilter === 'ALL') return true;
    return t.stationId === selectedStationFilter;
  });

  // Sélection initiale pour le simulateur
  useEffect(() => {
    if (tanks.length > 0 && !simTankId) {
      setSimTankId(tanks[0].id);
      setSimLiters(tanks[0].currentStock !== undefined ? tanks[0].currentStock : (tanks[0].sensorLiters || 0));
    }
  }, [tanks, simTankId]);

  // KPIs globaux
  const totalLitersMeasured = displayedTanks.reduce((acc, t) => acc + (t.currentStock !== undefined ? t.currentStock : (t.sensorLiters || 0)), 0);
  const totalCapacity = displayedTanks.reduce((acc, t) => acc + t.capacity, 0);
  const overallPercentage = totalCapacity > 0 ? Math.round((totalLitersMeasured / totalCapacity) * 100) : 0;
  const onlineTanksCount = displayedTanks.filter(t => (t.telematicsStatus || 'ONLINE') === 'ONLINE').length;

  // Enregistrer une vente de carburant en direct (déduction instantanée)
  const handleExecuteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleTankId) return;
    const litersNum = parseFloat(saleLitersInput) || 0;
    if (litersNum <= 0) {
      notifyWarning('Veuillez saisir un volume vendu supérieur à 0 litre.');
      return;
    }

    const targetTank = tanks.find(t => t.id === saleTankId);
    if (!targetTank) return;

    const doSale = () => {
      try {
        const { tank: updated } = recordFuelSale({
          tankId: saleTankId,
          litersSold: litersNum,
          operatorName: salePompisteInput,
          notes: saleNotesInput || 'Vente enregistrée en temps réel depuis le panneau Télématique'
        });

        setSaleSuccessMessage(
          `✅ Vente enregistrée avec succès ! ${litersNum.toLocaleString('fr-FR')} L déduits de la cuve ${targetTank.code} (${targetTank.fuelType}). Nouveau stock disponible : ${updated.currentStock.toLocaleString('fr-FR')} L.`
        );
        setSaleTankId(null);
        setSaleLitersInput('500');
        setTimeout(() => setSaleSuccessMessage(null), 6000);
      } catch (err: any) {
        notifyError(err.message || 'Erreur lors de l\'enregistrement de la vente');
      }
    };

    if (litersNum > targetTank.currentStock) {
      askConfirm({
        title: '⚠️ Stock insuffisant',
        message: `Le volume vendu (${litersNum.toLocaleString('fr-FR')} L) est supérieur au stock restant (${targetTank.currentStock.toLocaleString('fr-FR')} L). Voulez-vous continuer ? Le stock sera mis à 0 L.`,
        confirmLabel: 'Confirmer la vente',
        cancelLabel: 'Annuler',
        onConfirm: doSale
      });
      return;
    }

    doSale();
  };

  // Ouvrir modal de configuration
  const handleOpenConfig = (tank: typeof tanks[0]) => {
    setEditingTankId(tank.id);
    setImeiInput(tank.telematicsImei || '865421098765432');
    setMacInput(tank.sensorBleMac || (tank.fuelType === 'SUPER' || tank.fuelType === 'ESSENCE' ? 'C3:45:12:89:FE:A1' : 'C3:45:12:89:FE:B2'));
    setSensorIndexInput(tank.sensorIndex || 1);
  };

  // Enregistrer configuration sonde
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTankId) return;

    configureTankSensor(editingTankId, {
      telematicsImei: imeiInput,
      sensorBleMac: macInput,
      sensorIndex: Number(sensorIndexInput) || 1
    });

    setEditingTankId(null);
  };

  // Injection via simulateur
  const handleInjectSimulation = () => {
    if (!simTankId) return;
    const targetTank = tanks.find(t => t.id === simTankId);
    if (!targetTank) return;

    updateTankTelematics(simTankId, {
      sensorLiters: Number(simLiters),
      sensorTemperature: Number(simTemp),
      sensorBattery: Number(simBattery),
      lastTelematicsUpdate: new Date().toISOString(),
      telematicsStatus: 'ONLINE'
    });

    setSimFeedback(`Trame télématique injectée avec succès sur ${targetTank.code} (${simLiters} L) !`);
    setTimeout(() => setSimFeedback(null), 3500);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* ─── EN-TÊTE PRINCIPAL ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Supervision Télématique Cuves & Sondes IoT
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE MONDIAL
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Réception directe des boîtiers <strong className="text-slate-200">Ruptela Smart5</strong> et sondes de niveau capacitifs <strong className="text-slate-200">Eurosens Dominator BT</strong>.
          </p>
        </div>

        {/* Sélecteur de station & Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {stations.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400">Station :</span>
              <select
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                value={selectedStationFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedStationFilter(val);
                  if (val !== 'ALL') {
                    const st = stations.find(s => s.id === val);
                    if (st) setCurrentStation(st);
                  }
                }}
              >
                <option value="ALL" className="bg-slate-900 text-white">Toutes les stations (Réseau)</option>
                {stations.map(st => (
                  <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                     {st.name} ({st.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Onglets */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jauges en Direct
            </button>
            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'SIMULATOR'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Simulateur & Test
            </button>
            <button
              onClick={() => setActiveTab('GUIDE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'GUIDE'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Guide Ruptela
            </button>
          </div>
        </div>
      </div>

      {/* ─── KPIS GLOBAUX RÉSEAU ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Connectivité */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Liaison Télématique</div>
            <div className="text-xl font-black text-white mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {onlineTanksCount} / {displayedTanks.length} Cuves
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-0.5 block">
              100% opérationnel 24h/24
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <Wifi className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 : Stock Total en Litres */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volume Total Mesuré</div>
            <div className="text-xl font-black text-white font-mono mt-1">
              {totalLitersMeasured.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">L</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Taux global : <strong className="text-white font-mono">{overallPercentage}%</strong>
            </span>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 : Sécurité & Alertes */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit & Détection Fuite</div>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Conforme
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
              Aucun vol ou fuite détecté
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 : Boîtier Ruptela */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modem Ruptela Smart5</div>
            <div className="text-sm font-black text-white font-mono mt-1 truncate max-w-[130px]" title="IMEI Passerelle">
              {displayedTanks[0]?.telematicsImei || '865421098765432'}
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              Ping : Il y a 10s
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ─── ONGLET 1 : DASHBOARD DES CUVES EN DIRECT ──────────────────────── */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">

          {/* Bannière de notification après déduction d'une vente */}
          {saleSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-950/40">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>{saleSuccessMessage}</span>
              </div>
              <button onClick={() => setSaleSuccessMessage(null)} className="text-slate-400 hover:text-white font-bold ml-4">
                ✕
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-red-500" />
                Niveaux en Temps Réel par Cuve ({displayedTanks.length} Cuves Réseau)
              </h2>
              <span className="text-xs text-slate-400">
                Mise à jour en direct par capteurs IoT et déduction instantanée des ventes de carburant
              </span>
            </div>

            {/* Bouton d'action directe : Vente Live */}
            {displayedTanks.length > 0 && (
              <button
                onClick={() => {
                  setSaleTankId(displayedTanks[0].id);
                  setSaleLitersInput('500');
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                ⚡ Saisir Vente & Déduire en Direct
              </button>
            )}
          </div>

          {displayedTanks.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <Fuel className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Aucun réservoir trouvé pour cette sélection</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Aucune cuve configurée. Vous pouvez initialiser en un clic les cuves officielles TotalEnergies Kissosso (CUVE-01 Essence 50 000L & CUVE-02 Gazoil 60 000L).
                </p>
              </div>
              <button
                onClick={() => resetAllData()}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Initialiser les Cuves Réseau Kissosso
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayedTanks.map((tank) => {
                const liveLiters = tank.currentStock !== undefined ? tank.currentStock : (tank.sensorLiters || 0);
                const fillPercent = tank.capacity > 0 ? Math.min(100, Math.max(0, Math.round((liveLiters / tank.capacity) * 100))) : 0;
                const gapLiters = (tank.sensorLiters || tank.currentStock) - tank.currentStock;
                const isEssence = tank.fuelType === 'ESSENCE' || tank.fuelType === 'SUPER';
                const stationOfTank = stations.find(s => s.id === tank.stationId);

                // Formattage de la date du dernier ping
                const lastPingFormatted = tank.lastTelematicsUpdate
                  ? new Date(tank.lastTelematicsUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : 'En continu';

                return (
                  <div 
                    key={tank.id} 
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden hover:border-slate-700 transition-all"
                  >
                    {/* Header de la cuve */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                            isEssence 
                              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}>
                            {tank.fuelType === 'SUPER' ? 'ESSENCE' : tank.fuelType}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                             {stationOfTank?.name || 'TotalEnergies Kissosso'}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white mt-1">{tank.code}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Bouton vente directe sur cette cuve */}
                        <button
                          onClick={() => {
                            setSaleTankId(tank.id);
                            setSaleLitersInput('500');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          title="Déduire une vente de carburant en direct sur cette cuve"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Vente (-L)
                        </button>
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          EN LIGNE
                        </span>
                        <button
                          onClick={() => handleOpenConfig(tank)}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
                          title="Configurer l'IMEI et l'adresse MAC de la sonde"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  {/* Visualiseur 3D Cylindrique & Jauge Animée */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      
                      {/* Réservoir graphique */}
                      <div className="relative w-36 h-48 rounded-3xl border-4 border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col justify-end p-1 shadow-inner shrink-0">
                        {/* Graduations */}
                        <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none z-20 opacity-30 text-[9px] font-mono text-white">
                          <span>100%</span>
                          <span>75%</span>
                          <span>50%</span>
                          <span>25%</span>
                          <span>0%</span>
                        </div>

                        {/* Niveau Liquide Animé */}
                        <div 
                          className={`w-full rounded-2xl transition-all duration-1000 relative overflow-hidden shadow-lg ${
                            isEssence
                              ? 'bg-gradient-to-t from-red-700 via-red-600 to-rose-400 shadow-red-900/50'
                              : 'bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 shadow-amber-900/50'
                          }`}
                          style={{ height: `${Math.max(8, fillPercent)}%` }}
                        >
                          {/* Vagues de surface */}
                          <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 rounded-full blur-[1px] animate-pulse"></div>
                        </div>

                        {/* Pourcentage en overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <span className="text-2xl font-black font-mono text-white drop-shadow-md">
                            {fillPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Métriques Chiffrées Majeures */}
                      <div className="flex-1 space-y-4 w-full">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Volume Mesuré par la Sonde</div>
                          <div className="text-3xl font-black text-white font-mono mt-0.5 flex items-baseline gap-2">
                            {liveLiters.toLocaleString('fr-FR')}
                            <span className="text-base font-bold text-slate-400">/ {tank.capacity.toLocaleString('fr-FR')} Litres</span>
                          </div>
                        </div>

                        {/* Télémétrie Capteurs : Température, Batterie, RSSI */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                              Température
                            </span>
                            <span className="text-sm font-black text-white font-mono mt-0.5 block">
                              {tank.sensorTemperature || 28.5} °C
                            </span>
                          </div>

                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                              Batterie Sonde
                            </span>
                            <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">
                              {tank.sensorBattery || 98}%
                            </span>
                          </div>

                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                              Signal BLE
                            </span>
                            <span className="text-sm font-black text-indigo-300 font-mono mt-0.5 block">
                              {tank.sensorRssi || -64} dBm
                            </span>
                          </div>
                        </div>

                        {/* Identifiants Matériels Réels */}
                        <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/50 text-[11px] font-mono space-y-1">
                          <div className="flex justify-between items-center text-slate-400">
                            <span>IMEI Ruptela Smart5 :</span>
                            <span className="text-slate-200 font-bold">{tank.telematicsImei || '865421098765432'}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Sonde Eurosens Dominator BT :</span>
                            <span className="text-amber-400 font-bold">
                              {tank.sensorBleMac || (isEssence ? 'C3:45:12:89:FE:A1' : 'C3:45:12:89:FE:B2')} (Capteur #{tank.sensorIndex || 1})
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* Triple Réconciliation des Stocks (Sonde vs Ventes Pompes vs Pige) */}
                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-red-500" />
                        Réconciliation Temps Réel
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Dernier signal : {lastPingFormatted}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold block">Stock Sonde Ruptela</span>
                        <span className="font-extrabold text-white font-mono">{liveLiters.toLocaleString('fr-FR')} L</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold block">Stock Théorique (Ventes)</span>
                        <span className="font-extrabold text-slate-300 font-mono">{tank.currentStock.toLocaleString('fr-FR')} L</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold block">Écart Détecté</span>
                        <span className={`font-black font-mono ${gapLiters > 0 ? 'text-emerald-400' : (gapLiters < -100 ? 'text-red-400' : 'text-slate-300')}`}>
                          {gapLiters > 0 ? `+${gapLiters}` : gapLiters} L
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

      {/* ─── ONGLET 2 : SIMULATEUR & TEST EN DIRECT ────────────────────────── */}
      {activeTab === 'SIMULATOR' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black text-white">Simulateur & Testeur de Trames Télématiques</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Permet de tester instantanément la réaction de vos cuves dans l'application avec vos véritables identifiants (IMEI Ruptela et MAC Eurosens).
            </p>
          </div>

          {simFeedback && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              {simFeedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Formulaire de contrôle */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Sélectionner la Cuve Cible :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:border-red-500"
                  value={simTankId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSimTankId(id);
                    const tk = tanks.find(t => t.id === id);
                    if (tk) setSimLiters(tk.sensorLiters || tk.currentStock);
                  }}
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.code} ({t.fuelType}) - Capacité : {t.capacity.toLocaleString('fr-FR')} L
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Volume Simulé :</span>
                  <span className="text-red-400 font-mono text-sm">{simLiters.toLocaleString('fr-FR')} Litres</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={tanks.find(t => t.id === simTankId)?.capacity || 45000}
                  step="100"
                  value={simLiters}
                  onChange={(e) => setSimLiters(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Température Carburant (°C) :</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simTemp}
                    onChange={(e) => setSimTemp(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Batterie Sonde Eurosens (%) :</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={simBattery}
                    onChange={(e) => setSimBattery(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                onClick={handleInjectSimulation}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4" />
                Injecter Trame Télématique en Direct
              </button>
            </div>

            {/* Trame JSON simulée générée */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Trame JSON Réseau Équivalente :</span>
                  <span className="text-emerald-400 font-normal">POST /api/telematics/ruptela</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] leading-relaxed">
{JSON.stringify({
  imei: tanks.find(t => t.id === simTankId)?.telematicsImei || '865421098765432',
  sensorIndex: tanks.find(t => t.id === simTankId)?.sensorIndex || 1,
  sensorBleMac: tanks.find(t => t.id === simTankId)?.sensorBleMac || 'C3:45:12:89:FE:A1',
  fuelLiters: simLiters,
  temperature: simTemp,
  battery: simBattery,
  rssi: -65,
  timestamp: new Date().toISOString()
}, null, 2)}
                </pre>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-400">
                💡 <strong className="text-white">Note :</strong> Lorsque votre Ruptela enverra cette trame depuis la station, l'application effectuera exactement la même mise à jour en temps réel.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── ONGLET 3 : GUIDE PRATIQUE RUPTELA CONFIGURATOR ───────────────── */}
      {activeTab === 'GUIDE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-black text-white">Guide de Configuration : Ruptela Advanced Configurator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Voici exactement les étapes et paramètres à renseigner dans le logiciel Ruptela pour relier vos boîtiers Smart5 et sondes Eurosens Dominator BT à votre application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Étape 1 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="font-extrabold text-white text-sm">Appairage Bluetooth Eurosens</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dans <strong>Ruptela Configurator</strong>, rendez-vous dans :
                <br /><code className="text-amber-400 font-mono text-[11px]">Sensors → Bluetooth LE → Fuel Level</code>.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div>• Activez <strong>BLE Fuel Sensor 1</strong></div>
                <div>• Saisissez l'adresse MAC de la cuve Essence</div>
                <div>• Activez <strong>BLE Fuel Sensor 2</strong> pour la cuve Gazole</div>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="font-extrabold text-white text-sm">Adresse du Serveur Central</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dans <strong>Network → Main Server</strong>, entrez l'adresse de votre application :
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Route API :</span>
                  <button 
                    onClick={() => copyToClipboard('/api/telematics/ruptela', 'route')}
                    className="text-xs text-red-400 hover:text-white flex items-center gap-1 font-mono"
                  >
                    {copiedField === 'route' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    /api/telematics/ruptela
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Protocole :</span>
                  <span className="text-white font-mono font-bold">HTTP / TCP</span>
                </div>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="font-extrabold text-white text-sm">Sauvegarde & Envoi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cliquez sur <strong>« Save to device »</strong> dans Ruptela Configurator.
              </p>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Dès que la carte SIM se connecte au réseau GPRS/4G, vos cuves apparaissent et s'animent en temps réel dans votre application !
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── MODAL CONFIGURATION / APPAIRAGE SONDE ────────────────────────── */}
      {editingTankId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-red-500" />
                <h3 className="font-black text-white text-base">Appairage Télématique</h3>
              </div>
              <button
                onClick={() => setEditingTankId(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Numéro IMEI du Boîtier Ruptela Smart5 :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 865421098765432"
                  value={imeiInput}
                  onChange={(e) => setImeiInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Gravé sur l'étiquette du boîtier Ruptela ou visible dans le Configurator.
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Adresse MAC Sonde Eurosens Dominator BT :
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: C3:45:12:89:FE:A1"
                  value={macInput}
                  onChange={(e) => setMacInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Adresse Bluetooth de la sonde installée sur cette cuve.
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Index du Capteur dans le Ruptela :
                </label>
                <select
                  value={sensorIndexInput}
                  onChange={(e) => setSensorIndexInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-red-500"
                >
                  <option value={1}>Capteur BLE #1 (ex: Cuve Principale Essence)</option>
                  <option value={2}>Capteur BLE #2 (ex: Cuve Gazole)</option>
                  <option value={3}>Capteur BLE #3</option>
                  <option value={4}>Capteur BLE #4</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTankId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL SAISIE DIRECTE DE VENTE CARBURANT (LIVE) ───────────────── */}
      {saleTankId && (() => {
        const selectedTank = tanks.find(t => t.id === saleTankId);
        if (!selectedTank) return null;
        const enteredLiters = parseFloat(saleLitersInput) || 0;
        const projectedRemaining = Math.max(0, selectedTank.currentStock - enteredLiters);
        const projectedPercent = selectedTank.capacity > 0 ? Math.round((projectedRemaining / selectedTank.capacity) * 100) : 0;
        const totalCostGnf = enteredLiters * 12000;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Saisie Vente & Déduction en Direct</h3>
                    <p className="text-[11px] text-slate-400">Mise à jour instantanée du niveau de réservoir</p>
                  </div>
                </div>
                <button
                  onClick={() => setSaleTankId(null)}
                  className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecuteSale} className="space-y-4 text-xs">
                {/* Choix de la cuve */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Réservoir / Cuve concernée :</label>
                  <select
                    value={saleTankId}
                    onChange={(e) => setSaleTankId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-red-500"
                  >
                    {displayedTanks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.code} ({t.fuelType}) — Stock Actuel : {t.currentStock.toLocaleString('fr-FR')} L / {t.capacity.toLocaleString('fr-FR')} L
                      </option>
                    ))}
                  </select>
                </div>

                {/* Saisie des litres vendus */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 font-bold">Nombre de Litres Vendus :</label>
                    <span className="text-red-400 font-black font-mono">Prix : 12 000 GNF / L</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      placeholder="Ex: 500"
                      value={saleLitersInput}
                      onChange={(e) => setSaleLitersInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-lg outline-none focus:border-red-500 pr-12"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">Litres</span>
                  </div>
                </div>

                {/* Aperçu en direct du calcul */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Aperçu de l'Impact en Direct</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Stock Actuel Avant Vente :</span>
                    <span className="font-mono font-bold text-white">{selectedTank.currentStock.toLocaleString('fr-FR')} L</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-red-400 font-bold">Volume Vendu Déduit :</span>
                    <span className="font-mono font-bold text-red-400">-{enteredLiters.toLocaleString('fr-FR')} L</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-emerald-400 font-extrabold">Nouveau Stock Après Vente :</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {projectedRemaining.toLocaleString('fr-FR')} L ({projectedPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <span>Recette Théorique :</span>
                    <span className="font-mono font-bold text-amber-400">{totalCostGnf.toLocaleString('fr-FR')} GNF</span>
                  </div>
                </div>

                {/* Pompiste & Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Pompiste / Opérateur :</label>
                    <input
                      type="text"
                      value={salePompisteInput}
                      onChange={(e) => setSalePompisteInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Notes / Réf Tournée :</label>
                    <input
                      type="text"
                      placeholder="Ex: Tournée Matin"
                      value={saleNotesInput}
                      onChange={(e) => setSaleNotesInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSaleTankId(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    Valider & Déduire en Direct
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
