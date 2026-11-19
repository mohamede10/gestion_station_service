"use client";

import React, { useState } from 'react';
import { useStation } from '@/context/StationContext';
import { 
  Users, 
  FileText, 
  UserPlus, 
  DollarSign, 
  AlertCircle, 
  PlusCircle, 
  Edit3, 
  Save, 
  CheckCircle2,
  Trophy
} from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/ReceiptModal';

export default function RHSalairesPage() {
  const { 
    currentStation, 
    stations,
    userRole,
    employees, 
    addEmployee, 
    updateEmployee, 
    generateEmployeePayslip,
    notifySuccess
  } = useStation();

  const isGlobal = !currentStation;
  const filteredEmployees = isGlobal ? employees : employees.filter(e => e.stationId === currentStation.id);

  // Tab State: 'LIST' | 'NEW_EMP' | 'MANQUANTS'
  const [activeTab, setActiveTab] = useState<'LIST' | 'NEW_EMP' | 'MANQUANTS'>('LIST');

  // New Employee Form State
  const [fullName, setFullName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('Pompiste');
  const [baseSalary, setBaseSalary] = useState<string>('550000');
  const [transportAllowance, setTransportAllowance] = useState<string>('80000');
  const [livingAllowance, setLivingAllowance] = useState<string>('70000');
  const [housingAllowance, setHousingAllowance] = useState<string>('50000');
  const [prime, setPrime] = useState<string>('0');
  const [primeLabel, setPrimeLabel] = useState<string>('Prime de rendement');
  // Station selection for Super Admin
  const [selectedStationId, setSelectedStationId] = useState<string>(currentStation?.id || stations[0]?.id || '');

  // Adjust Employee Shortages / Loans Modal/Form State
  const [selectedEmpId, setSelectedEmpId] = useState<string>(filteredEmployees[0]?.id || '');
  const [shortagesInput, setShortagesInput] = useState<string>('0');
  const [loansInput, setLoansInput] = useState<string>('0');

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Handle Add Employee
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const targetStationId = isGlobal ? selectedStationId : currentStation?.id;

    addEmployee({
      fullName,
      jobTitle,
      stationId: targetStationId || undefined,
      baseSalary: parseFloat(baseSalary) || 0,
      transportAllowance: parseFloat(transportAllowance) || 0,
      livingAllowance: parseFloat(livingAllowance) || 0,
      housingAllowance: parseFloat(housingAllowance) || 0,
      prime: parseFloat(prime) || 0,
      primeLabel: primeLabel || 'Prime de rendement'
    });

    notifySuccess(`Employé "${fullName}" ajouté avec succès à l'effectif !`);
    setFullName('');
    setPrime('0');
    setActiveTab('LIST');
  };

  // Handle Adjust Shortages & Loans
  const handleAdjustDeductions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    updateEmployee(selectedEmpId, {
      shortages: parseFloat(shortagesInput) || 0,
      loans: parseFloat(loansInput) || 0
    });

    const emp = filteredEmployees.find(e => e.id === selectedEmpId);
    notifySuccess(`Retenues mises à jour pour ${emp?.fullName || 'l\'employé'} !`);
    setActiveTab('LIST');
  };

  const handlePrintSlip = (empId: string) => {
    const slip = generateEmployeePayslip(empId);
    if (slip) {
      setReceiptData(slip);
      setReceiptModalOpen(true);
    }
  };

  // Computations
  const totalBase = filteredEmployees.reduce((a, b) => a + b.baseSalary, 0);
  const totalAllowances = filteredEmployees.reduce((a, b) => a + (b.transportAllowance + b.livingAllowance + b.housingAllowance), 0);
  const totalPrimes = filteredEmployees.reduce((a, b) => a + (b.prime || 0), 0);
  const totalShortages = filteredEmployees.reduce((a, b) => a + b.shortages, 0);
  const totalLoans = filteredEmployees.reduce((a, b) => a + b.loans, 0);
  const totalNet = totalBase + totalAllowances + totalPrimes - totalShortages - totalLoans;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> MODULE RESSOURCES HUMAINES & PAIE DU PERSONNEL
          </div>
          <h2 className="text-2xl font-black text-white">Gestion du Personnel, Manquants Pompistes & Bulletins</h2>
          <p className="text-xs text-slate-400 mt-1">
            Registre des employés (Pompistes, Gardiens, Chefs de Piste), décompte des écarts de caisse et édition des fiches de paie.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'LIST' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Effectif & Salaires
          </button>
          <button
            onClick={() => setActiveTab('MANQUANTS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'MANQUANTS' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Manquants & Prêts
          </button>
          <button
            onClick={() => setActiveTab('NEW_EMP')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'NEW_EMP' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            + Nouvel Employé
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Effectif Actif</span>
          <div className="text-2xl font-black text-white mt-1">
            {filteredEmployees.length} <span className="text-xs text-slate-400">collaborateurs</span>
          </div>
          <span className="text-[11px] text-slate-500">Pompistes, gardiens, gérants</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Masse Salariale Brute</span>
          <div className="text-2xl font-black text-white mt-1">
            {(totalBase + totalAllowances).toLocaleString('fr-FR')} <span className="text-xs text-slate-400">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Base + Indemnités</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Retenues Manquants Pompistes</span>
          <div className="text-2xl font-black text-red-400 mt-1">
            -{totalShortages.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Écarts de caisse déduits</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Net Global à Payer Comptant</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {totalNet.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">GNF</span>
          </div>
          <span className="text-[11px] text-slate-500">Montant décaissé net</span>
        </div>
      </div>

      {/* Forms & Employee List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB: Nouvel Employé Form */}
        {activeTab === 'NEW_EMP' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserPlus className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-white text-base">Fiche de Recrutement Employé</h3>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3.5 text-xs">
              {/* Sélecteur de Station pour le Super Admin en vue globale */}
              {isGlobal && userRole === 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Station d'affectation :</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold outline-none focus:border-blue-500"
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nom & Prénom Complet :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: MAMADOU DIALLO"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Poste / Fonction :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-blue-500"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                >
                  <option value="Chef de Station (CDS)">Chef de Station (CDS)</option>
                  <option value="Chef de Piste (CDP)">Chef de Piste (CDP)</option>
                  <option value="Pompiste Senior">Pompiste Senior</option>
                  <option value="Pompiste">Pompiste</option>
                  <option value="Caissier">Caissier</option>
                  <option value="Gardien de Nuit">Gardien de Nuit</option>
                  <option value="Laveur / Entretien">Laveur / Entretien</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Salaire de Base (GNF) :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="ex: 550000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold outline-none focus:border-blue-500"
                  value={baseSalary}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setBaseSalary(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px]">Prime Transport :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-white font-mono text-xs outline-none focus:border-blue-500"
                    value={transportAllowance}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setTransportAllowance(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px]">Indemnité Panier :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-white font-mono text-xs outline-none focus:border-blue-500"
                    value={livingAllowance}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setLivingAllowance(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px]">Indem. Logement :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-white font-mono text-xs outline-none focus:border-blue-500"
                    value={housingAllowance}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setHousingAllowance(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px]">Prime de salaire (GNF) :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-amber-400 font-mono text-xs outline-none focus:border-blue-500"
                    value={prime}
                    onChange={(e) => setPrime(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px]">Libellé de la prime :</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                    value={primeLabel}
                    onChange={(e) => setPrimeLabel(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" /> Enregistrer au Registre RH
              </button>
            </form>
          </div>
        )}

        {/* TAB: Saisie des Manquants Pompistes */}
        {activeTab === 'MANQUANTS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-white text-base">Imputation Manquants & Prêts</h3>
            </div>

            <form onSubmit={handleAdjustDeductions} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sélectionner le Collaborateur :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-amber-500"
                  value={selectedEmpId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedEmpId(id);
                    const emp = filteredEmployees.find(emp => emp.id === id);
                    if (emp) {
                      setShortagesInput(String(emp.shortages));
                      setLoansInput(String(emp.loans));
                    }
                  }}
                >
                  {filteredEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-red-400 font-extrabold mb-1">
                  Retenue Manquants Constatés (GNF) :
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full bg-slate-950 border border-red-900/80 rounded-xl px-3 py-2 text-red-400 font-mono font-bold text-sm outline-none focus:border-red-500"
                  value={shortagesInput}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setShortagesInput(e.target.value.replace(/[^0-9.]/g, ''))}
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Déduit directement du salaire net en fin de mois.
                </span>
              </div>

              <div>
                <label className="block text-amber-400 font-extrabold mb-1">
                  Remboursement Prêts & Avances (GNF) :
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full bg-slate-950 border border-amber-900/80 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-sm outline-none focus:border-amber-500"
                  value={loansInput}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setLoansInput(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" /> Appliquer les Retenues Salariales
              </button>
            </form>
          </div>
        )}

        {/* Employee List Column */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 ${activeTab === 'LIST' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              État Général des Salaires & Bulletins Certifiés ({filteredEmployees.length})
            </h3>
          </div>

          <div className="space-y-3">
            {filteredEmployees.map((emp) => {
              const totalAllowances = emp.transportAllowance + emp.livingAllowance + emp.housingAllowance;
              const gross = emp.baseSalary + totalAllowances;
              const net = gross + (emp.prime || 0) - emp.shortages - emp.loans;

              return (
                <div key={emp.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{emp.fullName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {emp.jobTitle}
                      </span>
                      {(emp.prime || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Prime accordée
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 flex flex-wrap items-center gap-3 text-[11px]">
                      <span>Base : <strong className="text-slate-200">{emp.baseSalary.toLocaleString('fr-FR')} GNF</strong></span>
                      <span>Indemnités : <strong className="text-slate-200">{totalAllowances.toLocaleString('fr-FR')} GNF</strong></span>
                      {(emp.prime || 0) > 0 && <span className="text-yellow-400 font-bold">🏆 {emp.primeLabel || 'Prime'} : +{(emp.prime || 0).toLocaleString('fr-FR')} GNF</span>}
                      {emp.shortages > 0 && <span className="text-red-400 font-bold">Manquants : -{emp.shortages.toLocaleString('fr-FR')} GNF</span>}
                      {emp.loans > 0 && <span className="text-amber-400 font-bold">Prêts : -{emp.loans.toLocaleString('fr-FR')} GNF</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">Net à Payer :</div>
                      <div className="font-black text-sm text-emerald-400 font-mono">
                        {net.toLocaleString('fr-FR')} GNF
                      </div>
                    </div>

                    <button
                      onClick={() => handlePrintSlip(emp.id)}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/40 flex items-center gap-1.5 transition shrink-0"
                    >
                      <FileText className="w-4 h-4" /> Bulletin Paie
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Certified Payslip Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={receiptData}
      />

    </div>
  );
}
