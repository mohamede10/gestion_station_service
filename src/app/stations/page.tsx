"use client";

import React, { useState } from 'react';
import { useStation, CreateStationInput, UserRole } from '@/context/StationContext';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Fuel, 
  Users, 
  Coins, 
  Trash2, 
  Settings, 
  ArrowRight, 
  ArrowLeft, 
  Droplets, 
  Gauge, 
  UserCheck, 
  X,
  Sparkles,
  Info,
  AlertTriangle,
  UserPlus,
  CreditCard,
  KeyRound,
  HardHat,
  RotateCcw
} from 'lucide-react';

export default function StationsPage() {
  const { 
    stations, 
    addStation, 
    setCurrentStation, 
    currentStation, 
    tanks, 
    pumps, 
    employees, 
    subscribers,
    users,
    addUser,
    deleteUser,
    addEmployee,
    deleteEmployee,
    addSubscriber,
    deleteSubscriber,
    addTankToStation,
    addPumpToStation,
    deleteStation,
    deleteAllStations,
    deleteTank,
    deletePump,
    userRole,
    resetAllData,
    notifySuccess,
    notifyError,
    askConfirm,
    generateStationCode,
    generateSubscriberCode
  } = useStation();

  // Modal de confirmation de suppression de TOUTES les stations
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // ── Admin Console Tabs ──────────────────────────────────────────────────────
  const [adminTab, setAdminTab] = useState<'GERANTS' | 'POMPISTES' | 'ABONNES'>('GERANTS');

  // ── Form: Nouveau Compte Gérant / Accès ─────────────────────────────────────
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('admin');
  const [newUserRole, setNewUserRole] = useState<UserRole>('GERANT');
  const [newUserStationId, setNewUserStationId] = useState(stations[0]?.id || '');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: newUserPassword || 'admin',
      role: newUserRole,
      stationId: newUserRole === 'SUPER_ADMIN' ? null : (newUserStationId || null),
    });
    notifySuccess(`Compte "${newUserName}" créé avec succès ! Il peut maintenant se connecter.`);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('admin');
  };

  // ── Form: Nouveau Pompiste ───────────────────────────────────────────────────
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpTitle, setNewEmpTitle] = useState('Pompiste');
  const [newEmpSalary, setNewEmpSalary] = useState('550000');
  const [newEmpStation, setNewEmpStation] = useState(stations[0]?.id || '');

  const handleAddEmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    addEmployee({
      fullName: newEmpName.trim(),
      jobTitle: newEmpTitle,
      stationId: newEmpStation || undefined,
      baseSalary: parseFloat(newEmpSalary) || 550000,
      transportAllowance: 80000,
      livingAllowance: 70000,
      housingAllowance: 50000,
    });
    notifySuccess(`Pompiste "${newEmpName}" ajouté avec succès à l'effectif !`);
    setNewEmpName('');
  };

  // ── Form: Nouvel Abonné (Code Client auto-attribué par le système) ─────────────
  const [newSubCode, setNewSubCode] = useState(() => generateSubscriberCode());
  const [newSubName, setNewSubName] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('+224 ');
  const [newSubAddress, setNewSubAddress] = useState('Conakry');
  const [newSubStation, setNewSubStation] = useState(stations[0]?.id || '');
  const [newSubAdvance, setNewSubAdvance] = useState('0');

  // Synchronisation dynamique du Code Client
  React.useEffect(() => {
    setNewSubCode(generateSubscriberCode());
  }, [subscribers.length]);

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const sub = addSubscriber({
      code: newSubCode.trim(),
      name: newSubName.trim(),
      phone: newSubPhone,
      address: newSubAddress,
      stationId: newSubStation || undefined,
      initialAdvance: parseFloat(newSubAdvance) || 0,
    });
    notifySuccess(`Abonné "${sub.name}" (${sub.code}) créé avec succès !`);
    setNewSubName('');
  };

  // Modale de Déploiement Nouvelle Station (Wizard multi-étapes)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État du formulaire de création de station (Code Unique auto-attribué)
  const [stationCity, setStationCity] = useState('Kankan');
  const [stationName, setStationName] = useState('TotalEnergies Kankan Aéroport');
  const [stationCode, setStationCode] = useState(() => generateStationCode('Kankan'));

  // Synchronisation dynamique du Code Station dès modification de la ville
  const handleCityChange = (val: string) => {
    setStationCity(val);
    setStationCode(generateStationCode(val));
  };

  // Cuves à créer (capacity et initialStock en string pour permettre la saisie libre)
  const [customTanks, setCustomTanks] = useState<Array<{ code: string; fuelType: 'ESSENCE' | 'GAZOIL' | 'SUPER'; capacity: string; initialStock: string }>>([
    { code: 'CUVE 01 - ESSENCE', fuelType: 'ESSENCE', capacity: '45000', initialStock: '0' },
    { code: 'CUVE 02 - GAZOIL', fuelType: 'GAZOIL', capacity: '45000', initialStock: '0' },
  ]);

  // Pompes à créer (unitPrice en string pour permettre la saisie libre)
  const [customPumps, setCustomPumps] = useState<Array<{ name: string; fuelType: 'ESSENCE' | 'GAZOIL' | 'SUPER'; tankIndex: number; unitPrice: string }>>([
    { name: 'Pompe 01 (Essence)', fuelType: 'ESSENCE', tankIndex: 0, unitPrice: '12000' },
    { name: 'Pompe 02 (Gazoil)', fuelType: 'GAZOIL', tankIndex: 1, unitPrice: '12000' },
  ]);

  // Personnel (Gérant & Pompistes)
  const [managerName, setManagerName] = useState('M. Barry (Gérant)');
  const [managerEmail, setManagerEmail] = useState('gerant.kankan@totalenergies.gn');
  const [managerPassword, setManagerPassword] = useState('admin');

  const [pompistesList, setPompistesList] = useState<Array<{ fullName: string; baseSalary: string }>>([
    { fullName: 'Mamadou Diallo', baseSalary: '1500000' },
    { fullName: 'Ousmane Camara', baseSalary: '1500000' }
  ]);

  // Modale Détails & Configuration d'une station existante
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const selectedStation = stations.find(s => s.id === selectedStationId) || null;

  // Formulaire rapide d'ajout de cuve / pompe dans la station existante
  const [newTankCode, setNewTankCode] = useState('');
  const [newTankFuel, setNewTankFuel] = useState<'ESSENCE' | 'GAZOIL' | 'SUPER'>('ESSENCE');
  const [newTankCap, setNewTankCap] = useState('45000');
  const [newTankStock, setNewTankStock] = useState('0');

  const [newPumpName, setNewPumpName] = useState('');
  const [newPumpFuel, setNewPumpFuel] = useState<'ESSENCE' | 'GAZOIL' | 'SUPER'>('ESSENCE');
  const [newPumpTankId, setNewPumpTankId] = useState('');

  // Présélections Cuves
  const applyTankPreset = (preset: '2tanks' | '3tanks' | '4tanks') => {
    if (preset === '2tanks') {
      setCustomTanks([
        { code: 'CUVE 01 - ESSENCE', fuelType: 'ESSENCE', capacity: '45000', initialStock: '0' },
        { code: 'CUVE 02 - GAZOIL', fuelType: 'GAZOIL', capacity: '45000', initialStock: '0' },
      ]);
      setCustomPumps([
        { name: 'Pompe 01 (Essence)', fuelType: 'ESSENCE', tankIndex: 0, unitPrice: '12000' },
        { name: 'Pompe 02 (Gazoil)', fuelType: 'GAZOIL', tankIndex: 1, unitPrice: '12000' },
      ]);
    } else if (preset === '3tanks') {
      setCustomTanks([
        { code: 'CUVE 01 - ESSENCE', fuelType: 'ESSENCE', capacity: '45000', initialStock: '0' },
        { code: 'CUVE 02 - GAZOIL', fuelType: 'GAZOIL', capacity: '45000', initialStock: '0' },
        { code: 'CUVE 03 - GAZOIL PRO', fuelType: 'GAZOIL', capacity: '50000', initialStock: '0' },
      ]);
      setCustomPumps([
        { name: 'Pompe 01 (Essence)', fuelType: 'ESSENCE', tankIndex: 0, unitPrice: '12000' },
        { name: 'Pompe 02 (Gazoil)', fuelType: 'GAZOIL', tankIndex: 1, unitPrice: '12000' },
        { name: 'Pompe 03 (Gazoil Poids Lourds)', fuelType: 'GAZOIL', tankIndex: 2, unitPrice: '12000' },
      ]);
    } else if (preset === '4tanks') {
      setCustomTanks([
        { code: 'CUVE 01 - ESSENCE 1', fuelType: 'ESSENCE', capacity: '45000', initialStock: '0' },
        { code: 'CUVE 02 - ESSENCE 2', fuelType: 'ESSENCE', capacity: '45000', initialStock: '0' },
        { code: 'CUVE 03 - GAZOIL 1', fuelType: 'GAZOIL', capacity: '50000', initialStock: '0' },
        { code: 'CUVE 04 - GAZOIL 2', fuelType: 'GAZOIL', capacity: '50000', initialStock: '0' },
      ]);
      setCustomPumps([
        { name: 'Pompe 01 (Essence A)', fuelType: 'ESSENCE', tankIndex: 0, unitPrice: '12000' },
        { name: 'Pompe 02 (Essence B)', fuelType: 'ESSENCE', tankIndex: 1, unitPrice: '12000' },
        { name: 'Pompe 03 (Gazoil A)', fuelType: 'GAZOIL', tankIndex: 2, unitPrice: '12000' },
        { name: 'Pompe 04 (Gazoil B)', fuelType: 'GAZOIL', tankIndex: 3, unitPrice: '12000' },
      ]);
    }
  };

  // Soumission finale du déploiement
  const handleDeployStation = async () => {
    if (!stationName.trim() || !stationCity.trim()) {
      notifyError('Veuillez renseigner le nom et la ville de la station.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateStationInput = {
        code: stationCode,
        name: stationName,
        city: stationCity,
        // Parser les strings en nombres uniquement à la soumission
        tanks: customTanks.map(t => ({
          ...t,
          capacity: parseFloat(t.capacity) || 0,
          initialStock: parseFloat(t.initialStock) || 0,
        })),
        pumps: customPumps.map(p => ({
          ...p,
          unitPrice: parseFloat(p.unitPrice) || 0,
        })),
        manager: managerEmail ? {
          fullName: managerName,
          email: managerEmail,
          password: managerPassword || 'admin'
        } : undefined,
        pompistes: pompistesList
          .filter(p => p.fullName.trim().length > 0)
          .map(p => ({ ...p, baseSalary: parseFloat(p.baseSalary) || 0 }))
      };

      const newSt = await addStation(payload);

      setIsSubmitting(false);
      setIsWizardOpen(false);
      setWizardStep(1);
      setCurrentStation(newSt);

      notifySuccess(`Station "${newSt.name}" déployée avec succès avec ${customTanks.length} cuves et ${customPumps.length} pompes !`);

      // Réinitialiser pour le prochain déploiement avec le code automatique suivant
      setStationName('');
      setStationCity('');
      setStationCode(generateStationCode(''));
    } catch (e: any) {
      setIsSubmitting(false);
      notifyError('Erreur lors du déploiement : ' + (e.message || e.toString()));
    }
  };

  // Modale de Confirmation de Suppression Définitive (Station individuelle)
  const [stationToDelete, setStationToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingStation, setIsDeletingStation] = useState<boolean>(false);

  // Déclencheur ouverture modale de confirmation
  const promptDeleteStation = (stId: string, stName: string) => {
    setStationToDelete({ id: stId, name: stName });
  };

  // Exécution de la suppression d'une station
  const handleConfirmDeleteStation = async () => {
    if (!stationToDelete) return;
    setIsDeletingStation(true);
    try {
      await deleteStation(stationToDelete.id);
      notifySuccess(`Station "${stationToDelete.name}" supprimée avec succès.`);
      if (selectedStationId === stationToDelete.id) {
        setSelectedStationId(null);
      }
      setStationToDelete(null);
    } catch (e: any) {
      notifyError("Erreur lors de la suppression de la station : " + (e.message || e.toString()));
    } finally {
      setIsDeletingStation(false);
    }
  };

  // Exécution de la suppression de TOUTES les stations
  const handleConfirmDeleteAllStations = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllStations();
      notifySuccess("Toutes les stations ont été supprimées avec succès.");
      setSelectedStationId(null);
      setIsDeleteAllModalOpen(false);
    } catch (e: any) {
      notifyError("Erreur lors de la suppression de toutes les stations : " + (e.message || e.toString()));
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /> CONSOLE DE SUPERVISION SUPER-ADMIN
          </div>
          <h1 className="text-1xl sm:text-2xl font-black text-white tracking-tight">Réseau National des Stations TotalEnergies</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Déployez de nouvelles stations-services, configurez sur mesure les cuves (Essence / Gazoil), les pompes électroniques, les comptes gérants et les équipes de pompistes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setCurrentStation(null)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <span>Vue Réseau Globale</span>
          </button>

          <button
            onClick={() => {
              setIsWizardOpen(true);
              setWizardStep(1);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-950/40 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Déployer une Nouvelle Station</span>
          </button>

          {stations.length > 0 && (
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-red-950/60 hover:bg-red-900/80 text-red-400 hover:text-red-300 border border-red-800/60 transition flex items-center gap-2 cursor-pointer shadow-md shadow-red-950/40"
              title="Supprimer toutes les stations et leurs données associées"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Supprimer Toutes les Stations</span>
            </button>
          )}
        </div>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Stations Déployées</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{stations.length}</span>
          <span className="text-[10px] text-emerald-400 font-semibold">Toutes interconnectées</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Cuves Réseau</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">{tanks.length}</span>
          <span className="text-[10px] text-slate-400">{tanks.filter(t => t.fuelType === 'ESSENCE' || t.fuelType === 'SUPER').length} Essence | {tanks.filter(t => t.fuelType === 'GAZOIL').length} Gazoil</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Pompes Actives</span>
          <span className="text-2xl font-black text-red-400 font-mono mt-1 block">{pumps.length}</span>
          <span className="text-[10px] text-slate-400">Électroniques étalonnées</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Effectif Global</span>
          <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">{employees.length}</span>
          <span className="text-[10px] text-slate-400">Pompistes & Gérants</span>
        </div>
      </div>

      {/* Stations List Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Stations-Services Opérationnelles ({stations.length})
          </h2>
          <div className="flex items-center gap-2">
            {stations.length > 0 && (
              <button
                onClick={() => setIsDeleteAllModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 transition flex items-center gap-1.5"
                title="Supprimer toutes les stations d'un coup"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer Tout ({stations.length})</span>
              </button>
            )}
            <span className="text-xs text-slate-400 hidden md:inline">Cliquez sur une station pour l'administrer ou la configurer</span>
          </div>
        </div>

        {stations.length === 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Aucune Station dans le Réseau</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
              Toutes les stations ont été supprimées. Vous pouvez déployer une nouvelle station personnalisée dès maintenant ou réinitialiser le réseau avec les stations par défaut.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsWizardOpen(true);
                  setWizardStep(1);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-950/40 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Déployer une Nouvelle Station</span>
              </button>
              <button
                onClick={resetAllData}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Restaurer les Stations Réseau par Défaut</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stations.map((st) => {
              const isSelected = currentStation?.id === st.id;
              const stTanks = tanks.filter(t => t.stationId === st.id);
              const stPumps = pumps.filter(p => p.stationId === st.id);
              const stEmployees = employees.filter(e => e.stationId === st.id);
              const stSubs = subscribers.filter(s => s.stationId === st.id);

              const totalCap = stTanks.reduce((acc, t) => acc + t.capacity, 0);
              const totalStock = stTanks.reduce((acc, t) => acc + t.currentStock, 0);

              return (
                <div 
                  key={st.id} 
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-slate-900 border-red-500 shadow-xl shadow-red-950/40 ring-2 ring-red-500/20' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
                  }`}
                >
                  {/* Station Card Header */}
                  <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-extrabold text-base text-white tracking-tight leading-tight">{st.name}</h3>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> 
                          <span className="font-medium text-slate-300">{st.city}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 shrink-0">
                        {st.code}
                      </span>
                    </div>

                    {/* Stock Progress Mini Bar */}
                    <div className="mt-3 pt-3 border-t border-slate-800/60">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Stock Carburants Global :</span>
                        <span className="font-mono font-bold text-white">
                          {totalStock.toLocaleString('fr-FR')} / {totalCap.toLocaleString('fr-FR')} L
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full"
                          style={{ width: `${totalCap > 0 ? Math.min(100, Math.round((totalStock / totalCap) * 100)) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Station Metrics Grid */}
                  <div className="p-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                      <span className="block font-extrabold text-white font-mono text-sm">{stTanks.length}</span>
                      <span className="text-[10px] text-slate-400">Cuves</span>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                      <span className="block font-extrabold text-white font-mono text-sm">{stPumps.length}</span>
                      <span className="text-[10px] text-slate-400">Pompes</span>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                      <span className="block font-extrabold text-white font-mono text-sm">{stEmployees.length}</span>
                      <span className="text-[10px] text-slate-400">Pompistes</span>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                      <span className="block font-extrabold text-white font-mono text-sm">{stSubs.length}</span>
                      <span className="text-[10px] text-slate-400">Abonnés</span>
                    </div>
                  </div>

                  {/* Station Card Footer Actions */}
                  <div className="p-4 pt-2 bg-slate-950/30 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedStationId(st.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition flex items-center gap-1.5"
                      title="Configurer cuves, pompes et personnel"
                    >
                      <Settings className="w-3.5 h-3.5 text-amber-400" />
                      <span>Détails & Config</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentStation(st)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-red-600 text-white shadow-md shadow-red-950/50' 
                            : 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Station Active' : 'Activer'}</span>
                      </button>

                      <button
                        onClick={() => promptDeleteStation(st.id, st.name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition border border-transparent hover:border-red-900/40"
                        title="Supprimer cette station"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* CONSOLE D'ADMINISTRATION : GÉRANTS, POMPISTES & ABONNÉS */}
      {/* ==================================================================== */}
      {userRole === 'SUPER_ADMIN' && (
        <div className="space-y-4">
          {/* Section Header */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" /> CONSOLE D'ADMINISTRATION RH & CLIENTS
            </div>
            <h2 className="text-lg font-extrabold text-white">Gestion du Personnel & des Abonnés</h2>
            <p className="text-xs text-slate-400 mt-1">Créez des comptes de connexion (Gérants, Chefs de piste, Caissiers), ajoutez des pompistes et enregistrez des abonnés pour n'importe quelle station du réseau.</p>
          </div>

          {/* Admin Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setAdminTab('GERANTS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                adminTab === 'GERANTS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" /> Gérants & Comptes d'Accès ({users.filter(u => u.role !== 'SUPER_ADMIN').length})
            </button>
            <button
              onClick={() => setAdminTab('POMPISTES')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                adminTab === 'POMPISTES'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" /> Pompistes & Équipes ({employees.length})
            </button>
            <button
              onClick={() => setAdminTab('ABONNES')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                adminTab === 'ABONNES'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Abonnés & Entreprises ({subscribers.length})
            </button>
          </div>

          {/* ── TAB: GÉRANTS & COMPTES ─────────────────────────────────────────── */}
          {adminTab === 'GERANTS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                  <UserPlus className="w-4 h-4 text-blue-400" /> Créer un Nouveau Compte d'Accès
                </h3>
                <form onSubmit={handleAddUser} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nom Complet :</label>
                    <input
                      required
                      type="text"
                      placeholder="ex: Moussa Touré"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-blue-500"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Adresse Email (identifiant de connexion) :</label>
                    <input
                      required
                      type="email"
                      placeholder="ex: gerant.moussa@totalenergies.gn"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-blue-300 font-mono outline-none focus:border-blue-500"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Mot de Passe :</label>
                    <input
                      type="text"
                      placeholder="Mot de passe"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono outline-none focus:border-blue-500"
                      value={newUserPassword}
                      onChange={e => setNewUserPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Rôle :</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500"
                        value={newUserRole}
                        onChange={e => setNewUserRole(e.target.value as UserRole)}
                      >
                        <option value="GERANT">Gérant</option>
                        <option value="CHEF_PISTE">Chef de Piste</option>
                        <option value="CAISSIER">Caissier</option>
                        <option value="SUPER_ADMIN"> Vue Réseau GlobaleSuper Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Station Assignée :</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500"
                        value={newUserStationId}
                        onChange={e => setNewUserStationId(e.target.value)}
                        disabled={newUserRole === 'SUPER_ADMIN'}
                      >
                        {stations.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-950/40 transition flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" /> Créer le Compte d'Accès
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-blue-400" /> Comptes Existants ({users.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {users.map(u => {
                    const st = stations.find(s => s.id === u.stationId);
                    const roleColors: Record<string, string> = {
                      SUPER_ADMIN: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
                      GERANT: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
                      CHEF_PISTE: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
                      CAISSIER: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
                    };
                    const roleLabels: Record<string, string> = {
                      SUPER_ADMIN: 'Super Admin',
                      GERANT: 'Gérant',
                      CHEF_PISTE: 'Chef de Piste',
                      CAISSIER: 'Caissier',
                    };
                    return (
                      <div key={u.id} className="flex items-center justify-between gap-2 bg-slate-950/60 border border-slate-800/60 rounded-xl px-3.5 py-2.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">{u.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColors[u.role] || ''}`}>
                              {roleLabels[u.role] || u.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{u.email}</div>
                          {st && <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{st.name}</div>}
                        </div>
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            type="button"
                            onClick={() => {
                              askConfirm({
                                title: "Supprimer Compte d'Accès",
                                message: `Voulez-vous vraiment supprimer le compte d'accès de ${u.name} (${u.role}) ?`,
                                onConfirm: () => {
                                  deleteUser(u.id);
                                  notifySuccess(`Compte de ${u.name} supprimé avec succès.`);
                                }
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition shrink-0"
                            title="Supprimer ce compte"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {users.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Aucun compte créé</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: POMPISTES & ÉQUIPES ───────────────────────────────────────── */}
          {adminTab === 'POMPISTES' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                  <HardHat className="w-4 h-4 text-amber-400" /> Ajouter un Pompiste / Employé
                </h3>
                <form onSubmit={handleAddEmp} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nom Complet :</label>
                    <input
                      required
                      type="text"
                      placeholder="ex: Ibrahima Sory Diallo"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-amber-500"
                      value={newEmpName}
                      onChange={e => setNewEmpName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Poste :</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white outline-none focus:border-amber-500"
                        value={newEmpTitle}
                        onChange={e => setNewEmpTitle(e.target.value)}
                      >
                        <option>Pompiste</option>
                        <option>Chef de Piste</option>
                        <option>Caissier</option>
                        <option>Agent de Sécurité</option>
                        <option>Technicien</option>
                        <option>Gérant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Salaire de base (GNF) :</label>
                      <input
                        type="number"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white font-mono outline-none focus:border-amber-500"
                        value={newEmpSalary}
                        onChange={e => setNewEmpSalary(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Station d'affectation :</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white outline-none focus:border-amber-500"
                      value={newEmpStation}
                      onChange={e => setNewEmpStation(e.target.value)}
                    >
                      {stations.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Ajouter à l'Équipe
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-amber-400" /> Effectif du Réseau ({employees.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {employees.map(emp => {
                    const st = stations.find(s => s.id === emp.stationId);
                    return (
                      <div key={emp.id} className="flex items-center justify-between gap-2 bg-slate-950/60 border border-slate-800/60 rounded-xl px-3.5 py-2.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">{emp.fullName}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">{emp.jobTitle}</span>
                          </div>
                          {st && <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{st.name}</div>}
                          <div className="text-[11px] text-slate-500 font-mono">{emp.baseSalary.toLocaleString('fr-FR')} GNF / mois</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            askConfirm({
                              title: "Retirer de l'Effectif",
                              message: `Voulez-vous retirer ${emp.fullName} (${emp.jobTitle}) de l'effectif ?`,
                              onConfirm: () => {
                                deleteEmployee(emp.id);
                                notifySuccess(`Employé ${emp.fullName} retiré de l'effectif.`);
                              }
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition shrink-0"
                          title="Retirer cet employé"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {employees.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Aucun employé enregistré</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: ABONNÉS & ENTREPRISES ─────────────────────────────────────── */}
          {adminTab === 'ABONNES' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Créer un Nouvel Abonné
                </h3>
                <form onSubmit={handleAddSub} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                        <span>Code Client :</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">Auto-attribué</span>
                      </label>
                      <input
                        required
                        type="text"
                        readOnly
                        className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 font-mono font-bold outline-none cursor-not-allowed"
                        value={newSubCode}
                        title="Code Client auto-attribué par le système"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Téléphone :</label>
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500"
                        value={newSubPhone}
                        onChange={e => setNewSubPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Raison Sociale / Nom :</label>
                    <input
                      required
                      type="text"
                      placeholder="ex: Société Minière de Guinée"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-emerald-500"
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Station :</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white outline-none focus:border-emerald-500"
                        value={newSubStation}
                        onChange={e => setNewSubStation(e.target.value)}
                      >
                        {stations.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Avance Initiale (GNF) :</label>
                      <input
                        type="number"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white font-mono outline-none focus:border-emerald-500"
                        value={newSubAdvance}
                        onChange={e => setNewSubAdvance(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Enregistrer l'Abonné
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Abonnés du Réseau ({subscribers.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {subscribers.map(sub => {
                    const st = stations.find(s => s.id === sub.stationId);
                    return (
                      <div key={sub.id} className="flex items-center justify-between gap-2 bg-slate-950/60 border border-slate-800/60 rounded-xl px-3.5 py-2.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold font-mono text-emerald-400">{sub.code}</span>
                            <span className="text-xs font-bold text-white">{sub.name}</span>
                          </div>
                          {st && <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{st.name}</div>}
                          <div className="text-[11px] text-slate-500">Solde : {(sub.currentAdvance - sub.currentCredit).toLocaleString('fr-FR')} GNF</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            askConfirm({
                              title: "Supprimer Client Abonné",
                              message: `Voulez-vous supprimer le compte abonné de ${sub.name} (${sub.code}) ?`,
                              onConfirm: () => {
                                deleteSubscriber(sub.id);
                                notifySuccess(`Abonné ${sub.name} supprimé avec succès.`);
                              }
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition shrink-0"
                          title="Supprimer cet abonné"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {subscribers.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Aucun abonné enregistré</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL WIZARD: DÉPLOIEMENT COMPLET NOUVELLE STATION */}
      {/* ==================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Déploiement Multi-Stations
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Création d'une Nouvelle Station TotalEnergies
                </h2>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setWizardStep(1)}
                className={`flex items-center gap-2 pb-1 border-b-2 transition whitespace-nowrap px-2 ${
                  wizardStep === 1 ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-center leading-5 text-[11px]">1</span>
                Identité Station
              </button>
              <button
                onClick={() => setWizardStep(2)}
                className={`flex items-center gap-2 pb-1 border-b-2 transition whitespace-nowrap px-2 ${
                  wizardStep === 2 ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-center leading-5 text-[11px]">2</span>
                Cuves ({customTanks.length})
              </button>
              <button
                onClick={() => setWizardStep(3)}
                className={`flex items-center gap-2 pb-1 border-b-2 transition whitespace-nowrap px-2 ${
                  wizardStep === 3 ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-center leading-5 text-[11px]">3</span>
                Pompes ({customPumps.length})
              </button>
              <button
                onClick={() => setWizardStep(4)}
                className={`flex items-center gap-2 pb-1 border-b-2 transition whitespace-nowrap px-2 ${
                  wizardStep === 4 ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-center leading-5 text-[11px]">4</span>
                Gérant & Équipe
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              
              {/* ================= STEP 1: IDENTITÉ STATION ================= */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-amber-950/30 border border-amber-800/40 p-3.5 rounded-xl text-amber-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Renseignez les informations officielles de la station-service. Les données seront automatiquement cloisonnées par station.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                      <span>Code Unique de la Station :</span>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">Auto-attribué par le système</span>
                    </label>
                    <input
                      type="text"
                      required
                      readOnly
                      className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-400 font-mono font-bold text-sm outline-none cursor-not-allowed"
                      value={stationCode}
                      title="Code Unique de Station généré automatiquement par le système"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Nom Complet de la Station :</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: TotalEnergies Kankan Aéroport"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-amber-500"
                      value={stationName}
                      onChange={(e) => setStationName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Ville / Préfecture :</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Kankan, Labé, Kindia, Mamou, Boké, Conakry..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-amber-500"
                      value={stationCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ================= STEP 2: CUVES DE CARBURANTS ================= */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  {/* Presets rapides */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Configuration Rapide des Cuves :</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => applyTankPreset('2tanks')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700"
                      >
                        2 Cuves (Std)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTankPreset('3tanks')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700"
                      >
                        3 Cuves
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTankPreset('4tanks')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700"
                      >
                        4 Cuves
                      </button>
                    </div>
                  </div>

                  {/* Liste des cuves dynamiques */}
                  <div className="space-y-3">
                    {customTanks.map((tank, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Droplets className="w-4 h-4 text-amber-400" />
                            Cuve #{idx + 1}
                          </span>
                          
                          {customTanks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomTanks(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Supprimer cette cuve"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 font-semibold mb-1">Code / Nom de la Cuve :</label>
                            <input
                              type="text"
                              value={tank.code}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomTanks(prev => prev.map((t, i) => i === idx ? { ...t, code: val } : t));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Type Carburant :</label>
                            <select
                              value={tank.fuelType}
                              onChange={(e) => {
                                const val = e.target.value as 'ESSENCE' | 'GAZOIL';
                                setCustomTanks(prev => prev.map((t, i) => i === idx ? { ...t, fuelType: val } : t));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-bold"
                            >
                              <option value="ESSENCE" className="bg-slate-900 text-red-400">ESSENCE</option>
                              <option value="GAZOIL" className="bg-slate-900 text-amber-400">GAZOIL (Diesel)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Capacité (L) :</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="ex: 45000"
                              value={tank.capacity}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setCustomTanks(prev => prev.map((t, i) => i === idx ? { ...t, capacity: val } : t));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                          <span>Stock Initial au démarrage :</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={tank.initialStock}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setCustomTanks(prev => prev.map((t, i) => i === idx ? { ...t, initialStock: val } : t));
                              }}
                              className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-right"
                            />
                            <span>Litres</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomTanks(prev => [
                        ...prev, 
                        { 
                          code: `CUVE 0${prev.length + 1} - GAZOIL`, 
                          fuelType: 'GAZOIL', 
                          capacity: '45000', 
                          initialStock: '10000' 
                        }
                      ]);
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-500 text-slate-300 hover:text-amber-400 transition flex items-center justify-center gap-2 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une Cuve Supplémentaire
                  </button>
                </div>
              )}

              {/* ================= STEP 3: POMPES DE DISTRIBUTION ================= */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      Configuration des Pompes ({customPumps.length}) :
                    </span>
                    <span className="text-[11px] text-slate-400">Raccordées aux {customTanks.length} cuves créées</span>
                  </div>

                  <div className="space-y-3">
                    {customPumps.map((pump, pIdx) => (
                      <div key={pIdx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Gauge className="w-4 h-4 text-red-500" />
                            Pompe #{pIdx + 1}
                          </span>

                          {customPumps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomPumps(prev => prev.filter((_, i) => i !== pIdx));
                              }}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Supprimer cette pompe"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Nom / Numéro Pompe :</label>
                            <input
                              type="text"
                              value={pump.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomPumps(prev => prev.map((p, i) => i === pIdx ? { ...p, name: val } : p));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Cuve d'Alimentation :</label>
                            <select
                              value={pump.tankIndex}
                              onChange={(e) => {
                                const tIdx = Number(e.target.value);
                                const correspondingTank = customTanks[tIdx];
                                setCustomPumps(prev => prev.map((p, i) => i === pIdx ? { 
                                  ...p, 
                                  tankIndex: tIdx,
                                  fuelType: correspondingTank ? correspondingTank.fuelType : p.fuelType
                                } : p));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-bold"
                            >
                              {customTanks.map((t, idx) => (
                                <option key={idx} value={idx}>
                                  {t.code} ({t.fuelType})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 font-semibold mb-1">Prix Unitaire (GNF/L) :</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="ex: 12000"
                              value={pump.unitPrice}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setCustomPumps(prev => prev.map((p, i) => i === pIdx ? { ...p, unitPrice: val } : p));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomPumps(prev => [
                        ...prev, 
                        { 
                          name: `Pompe 0${prev.length + 1} (${customTanks[0]?.fuelType === 'SUPER' ? 'ESSENCE' : (customTanks[0]?.fuelType || 'ESSENCE')})`, 
                          fuelType: customTanks[0]?.fuelType || 'ESSENCE', 
                          tankIndex: 0, 
                          unitPrice: '12000' 
                        }
                      ]);
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-red-500 text-slate-300 hover:text-red-400 transition flex items-center justify-center gap-2 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une Pompe Supplémentaire
                  </button>
                </div>
              )}

              {/* ================= STEP 4: GÉRANT & PERSONNEL ================= */}
              {wizardStep === 4 && (
                <div className="space-y-5">
                  
                  {/* Gérant de Station */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                      <UserCheck className="w-4 h-4" />
                      Compte d'Accès Gérant Local
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Le gérant aura un espace restreint à cette station uniquement (gestion stocks, caisse, personnel local).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Nom et Prénom du Gérant :</label>
                        <input
                          type="text"
                          value={managerName}
                          onChange={(e) => setManagerName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                          placeholder="ex: M. Barry"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Email de Connexion :</label>
                        <input
                          type="email"
                          value={managerEmail}
                          onChange={(e) => setManagerEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                          placeholder="ex: gerant.station@totalenergies.gn"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Mot de passe par défaut :</label>
                      <input
                        type="text"
                        value={managerPassword}
                        onChange={(e) => setManagerPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Pompistes */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Users className="w-4 h-4 text-blue-400" />
                        Pompistes Affectés ({pompistesList.length})
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPompistesList(prev => [
                            ...prev, 
                            { fullName: `Pompiste ${prev.length + 1}`, baseSalary: '1500000' }
                          ]);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter un Pompiste
                      </button>
                    </div>

                    <div className="space-y-2">
                      {pompistesList.map((pomp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={pomp.fullName}
                            placeholder="Nom et prénom du pompiste"
                            onChange={(e) => {
                              const val = e.target.value;
                              setPompistesList(prev => prev.map((p, i) => i === idx ? { ...p, fullName: val } : p));
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                          />
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5">
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="1500000"
                              value={pomp.baseSalary}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setPompistesList(prev => prev.map((p, i) => i === idx ? { ...p, baseSalary: val } : p));
                              }}
                              className="w-20 bg-transparent text-white font-mono text-xs text-right outline-none"
                            />
                            <span className="text-[10px] text-slate-400">GNF</span>
                          </div>
                          {pompistesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setPompistesList(prev => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Résumé avant déploiement */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 space-y-1 text-xs">
                    <span className="font-bold block flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Prêt pour le Déploiement :
                    </span>
                    <div>• 1 Station : <strong>{stationName || 'Non défini'}</strong> ({stationCity})</div>
                    <div>• {customTanks.length} Cuves configurées</div>
                    <div>• {customPumps.length} Pompes électroniques</div>
                    <div>• Gérant : <strong>{managerName}</strong> ({managerEmail})</div>
                    <div>• {pompistesList.length} Pompistes enregistrés</div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Étape Précédente
                </button>
              ) : <div />}

              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition"
                >
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDeployStation}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSubmitting ? 'Déploiement en cours...' : '🚀 Déployer la Station & Initialiser'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL GESTION DÉTAILLÉE D'UNE STATION EXISTANTE */}
      {/* ==================================================================== */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/40 text-red-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">{selectedStation.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-mono text-amber-400">{selectedStation.code}</span> •
                    <span>{selectedStation.city}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStationId(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Tabs / Sections */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs flex-1">
              
              {/* Section 1: Cuves de cette station */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-amber-400" />
                    Cuves de Carburant ({tanks.filter(t => t.stationId === selectedStation.id).length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tanks.filter(t => t.stationId === selectedStation.id).map(tank => (
                    <div key={tank.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{tank.code}</div>
                        <div className="text-[11px] text-slate-400">
                          Type : <span className={(tank.fuelType === 'SUPER' || tank.fuelType === 'ESSENCE') ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>{tank.fuelType === 'SUPER' ? 'ESSENCE' : tank.fuelType}</span> | Cap : {tank.capacity.toLocaleString('fr-FR')} L
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono font-bold mt-1">
                          Stock Actuel : {tank.currentStock.toLocaleString('fr-FR')} L
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTank(tank.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-red-400 transition"
                        title="Supprimer la cuve"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formulaire ajout rapide de cuve */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-dashed border-slate-800 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nom cuve (ex: CUVE 03)"
                    value={newTankCode}
                    onChange={e => setNewTankCode(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white flex-1 min-w-[140px]"
                  />
                  <select
                    value={newTankFuel}
                    onChange={e => setNewTankFuel(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-bold"
                  >
                    <option value="ESSENCE">ESSENCE</option>
                    <option value="GAZOIL">GAZOIL</option>
                  </select>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Capacité (L)"
                    value={newTankCap}
                    onChange={e => setNewTankCap(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-mono w-24"
                  />
                  <button
                    onClick={() => {
                      if (!newTankCode.trim()) return;
                      addTankToStation(selectedStation.id, {
                        code: newTankCode.trim(),
                        fuelType: newTankFuel,
                        capacity: parseFloat(newTankCap) || 0,
                        initialStock: parseFloat(newTankStock) || 0
                      });
                      setNewTankCode('');
                    }}
                    className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                  >
                    + Ajouter Cuve
                  </button>
                </div>
              </div>

              {/* Section 2: Pompes de cette station */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-red-500" />
                    Pompes de Distribution ({pumps.filter(p => p.stationId === selectedStation.id).length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pumps.filter(p => p.stationId === selectedStation.id).map(pump => (
                    <div key={pump.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{pump.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Carburant : <span className={(pump.fuelType === 'SUPER' || pump.fuelType === 'ESSENCE') ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>{pump.fuelType === 'SUPER' ? 'ESSENCE' : pump.fuelType}</span>
                        </div>
                        <div className="text-[11px] text-amber-400 font-mono font-bold mt-1">
                          Prix : {pump.unitPrice.toLocaleString('fr-FR')} GNF/L
                        </div>
                      </div>
                      <button
                        onClick={() => deletePump(pump.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-red-400 transition"
                        title="Supprimer la pompe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formulaire ajout rapide de pompe */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-dashed border-slate-800 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nom pompe (ex: Pompe 03)"
                    value={newPumpName}
                    onChange={e => setNewPumpName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white flex-1 min-w-[140px]"
                  />
                  <select
                    value={newPumpFuel}
                    onChange={e => setNewPumpFuel(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-bold"
                  >
                    <option value="SUPER">SUPER</option>
                    <option value="GAZOIL">GAZOIL</option>
                  </select>
                  <button
                    onClick={() => {
                      if (!newPumpName.trim()) return;
                      const availTanks = tanks.filter(t => t.stationId === selectedStation.id);
                      const matchedTank = availTanks.find(t => t.fuelType === newPumpFuel) || availTanks[0];
                      addPumpToStation(selectedStation.id, {
                        name: newPumpName.trim(),
                        fuelType: newPumpFuel,
                        tankId: matchedTank ? matchedTank.id : `tk-${selectedStation.id}-def`,
                        unitPrice: 12000
                      });
                      setNewPumpName('');
                    }}
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                  >
                    + Ajouter Pompe
                  </button>
                </div>
              </div>

              {/* Section 3: Personnel */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Personnel de la Station ({employees.filter(e => e.stationId === selectedStation.id).length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {employees.filter(e => e.stationId === selectedStation.id).map(emp => (
                    <div key={emp.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{emp.fullName}</div>
                        <div className="text-[10px] text-slate-400">{emp.jobTitle} • {emp.baseSalary.toLocaleString('fr-FR')} GNF</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                        Actif
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => promptDeleteStation(selectedStation.id, selectedStation.name)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/50 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Supprimer cette Station
              </button>

              <button
                onClick={() => {
                  setCurrentStation(selectedStation);
                  setSelectedStationId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition flex items-center gap-1.5 shadow-md shadow-red-950"
              >
                <CheckCircle2 className="w-4 h-4" /> Définir comme Station Active
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* BOÎTE MODALE DE CONFIRMATION DE SUPPRESSION DÉFINITIVE */}
      {/* ==================================================================== */}
      {stationToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-lg w-full shadow-2xl shadow-red-950/60 overflow-hidden ring-1 ring-red-500/30 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                    Action Critique & Irréversible
                  </span>
                  <h3 className="text-base font-black text-white">
                    Confirmation de Suppression
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStationToDelete(null)}
                disabled={isDeletingStation}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="text-sm font-semibold text-slate-200 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement la station <span className="font-extrabold text-white bg-slate-950 px-2 py-0.5 rounded border border-red-800/50 text-red-200">"{stationToDelete.name}"</span> ainsi que toutes ses cuves, pompes et données associées ?
              </div>

              {/* Impact Card */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-2 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Données associées qui seront définitivement purgées :
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="block font-black text-white text-base">
                      {tanks.filter(t => t.stationId === stationToDelete.id).length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans font-medium">Cuves</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="block font-black text-white text-base">
                      {pumps.filter(p => p.stationId === stationToDelete.id).length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans font-medium">Pompes</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="block font-black text-white text-base">
                      {employees.filter(e => e.stationId === stationToDelete.id).length}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans font-medium">Employés</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Les relevés de tournée, index pompes, réceptions BL, jauges et décaissements propres à cette station seront également supprimés.
                </p>
              </div>

              {/* Warning Notice */}
              <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Avertissement :</strong> Cette opération est immédiate et ne peut pas être annulée.
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStationToDelete(null)}
                disabled={isDeletingStation}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteStation}
                disabled={isDeletingStation}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-950/60 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isDeletingStation ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Suppression en cours...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 text-white" />
                    <span>Oui, supprimer définitivement</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALE DE CONFIRMATION : SUPPRESSION DE TOUTES LES STATIONS */}
      {/* ==================================================================== */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/60 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-red-950/80 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-950/80 to-slate-900 p-5 border-b border-red-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Supprimer TOUTES les Stations</h3>
                  <p className="text-xs text-red-300 font-medium">Attention : action irréversible sur l'ensemble du réseau</p>
                </div>
              </div>
              <button
                onClick={() => !isDeletingAll && setIsDeleteAllModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                disabled={isDeletingAll}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Vous êtes sur le point de supprimer l'intégralité du réseau de stations (<strong>{stations.length} station{stations.length > 1 ? 's' : ''}</strong>).
              </p>

              {/* Cascade Deletion Summary */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Éléments qui seront supprimés en cascade :
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="block font-black text-white text-sm">{stations.length}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Stations</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="block font-black text-white text-sm">{tanks.length}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Cuves</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="block font-black text-white text-sm">{pumps.length}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Pompes</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="block font-black text-white text-sm">{employees.length}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Employés</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Les tournées pompes, stocks carburants, livraisons BL, créances abonnés et historiques de caisse associés seront également vidés.
                </p>
              </div>

              {/* Preservation Notice */}
              <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sécurité Super-Admin :</strong> Votre compte administrateur racine reste préservé intact afin que vous puissiez redéployer de nouvelles stations ou restaurer les données à tout moment.
                </span>
              </div>

              {/* Warning Notice */}
              <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Confirmation requise :</strong> Cette suppression définitive prend effet immédiatement sur la base de données et dans votre navigateur.
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                disabled={isDeletingAll}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50 cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteAllStations}
                disabled={isDeletingAll}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-950/60 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeletingAll ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Suppression de tout le réseau...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 text-white" />
                    <span>Oui, tout supprimer définitivement</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
