"use client";

import React from 'react';
import { useStation } from '@/context/StationContext';
import { 
  Fuel, 
  CreditCard, 
  Receipt, 
  AlertTriangle, 
  ArrowUpRight, 
  Droplets,
  Building2,
  Users,
  Coins,
  Truck,
  TrendingDown,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { 
    currentStation, 
    userRole, 
    stations, 
    tanks, 
    pumps, 
    subscribers, 
    expenses, 
    payments, 
    pumpShifts, 
    deliveries, 
    employees 
  } = useStation();

  const isGlobal = !currentStation;

  // Filtered collections
  const filteredTanks = isGlobal ? tanks : tanks.filter(t => t.stationId === currentStation.id);
  const filteredPumps = isGlobal ? pumps : pumps.filter(p => p.stationId === currentStation.id);
  const filteredSubscribers = isGlobal ? subscribers : subscribers.filter(s => s.stationId === currentStation.id);
  const filteredExpenses = isGlobal ? expenses : expenses.filter(e => e.stationId === currentStation.id);
  const filteredPayments = isGlobal ? payments : payments.filter(p => p.stationId === currentStation.id);
  const filteredShifts = isGlobal ? pumpShifts : pumpShifts.filter(s => s.stationId === currentStation.id);
  const filteredDeliveries = isGlobal ? deliveries : deliveries.filter(d => d.stationId === currentStation.id);
  const filteredEmployees = isGlobal ? employees : employees.filter(e => e.stationId === currentStation.id);

  // Calculations
  const superTank = filteredTanks.find(t => t.fuelType === 'SUPER') || filteredTanks[0];
  const gazoilTank = filteredTanks.find(t => t.fuelType === 'GAZOIL') || filteredTanks[1];

  const totalFuelLitersSold = filteredShifts.reduce((acc, s) => acc + s.litersSold, 0);
  const totalFuelRevenue = filteredShifts.reduce((acc, s) => acc + s.totalAmount, 0);

  const totalCreditBalance = filteredSubscribers.reduce((acc, s) => acc + s.currentCredit, 0);
  const totalAdvances = filteredSubscribers.reduce((acc, s) => acc + s.currentAdvance, 0);
  const netDueSubscribers = totalCreditBalance - totalAdvances;

  const totalSubscriberPayments = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalCashIn = totalFuelRevenue + totalSubscriberPayments;
  const totalExpensesAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netCashBalance = totalCashIn - totalExpensesAmount;

  // Tank Stock Totals
  const totalSuperStock = filteredTanks.filter(t => t.fuelType === 'SUPER').reduce((a, b) => a + b.currentStock, 0);
  const totalGazoilStock = filteredTanks.filter(t => t.fuelType === 'GAZOIL').reduce((a, b) => a + b.currentStock, 0);
  const totalAllFuelStock = totalSuperStock + totalGazoilStock;

  // Total Gap (Coulage / Pertes)
  const totalGap = filteredTanks.reduce((acc, t) => acc + (t.physicalStock - t.currentStock), 0);

  // Total Payroll
  const totalPayrollNet = filteredEmployees.reduce((acc, emp) => {
    const totalAllowances = emp.transportAllowance + emp.livingAllowance + emp.housingAllowance;
    return acc + (emp.baseSalary + totalAllowances - emp.shortages - emp.loans);
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            {isGlobal ? 'VUE STRATÉGIQUE CONSOLIDÉE SUPER-ADMIN' : `STATION : ${currentStation.name}`}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isGlobal ? `Supervision Globale des Stations (${stations.length} Stations)` : `Console de Gestion : ${currentStation.name}`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Indicateurs certifiés en temps réel : Carburants, Cuves, Abonnés, Caisse et Masse Salariale.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/carburants"
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/40 flex items-center gap-1.5 transition"
          >
            <Fuel className="w-4 h-4" /> Relevé Pompe
          </Link>
          <Link
            href="/abonnes"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-900/40 flex items-center gap-1.5 transition"
          >
            <CreditCard className="w-4 h-4" /> Versement Abonné
          </Link>
          <Link
            href="/caisse"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Receipt className="w-4 h-4 text-emerald-400" /> Sortie Caisse
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ventes Carburant Réalisées */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Recettes Pompes Enregistrées</span>
            <div className="p-2 rounded-xl bg-red-950/80 text-red-400 border border-red-800/40">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {totalFuelRevenue.toLocaleString('fr-FR')} <span className="text-xs text-red-400 font-bold">GNF</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-400 font-medium">{totalFuelLitersSold.toLocaleString('fr-FR')} L vendus</span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> En cours
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Stock Cuves Restant */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Stock Cuves Disponible</span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/40">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {totalAllFuelStock.toLocaleString('fr-FR')} <span className="text-xs text-amber-400 font-bold">Litres</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Super : <strong className="text-white font-bold">{totalSuperStock.toLocaleString('fr-FR')}L</strong></span>
              <span>Gazoil : <strong className="text-white font-bold">{totalGazoilStock.toLocaleString('fr-FR')}L</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 3: Restant Dû Abonnés */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Créances Abonnés & Flottes</span>
            <div className="p-2 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800/40">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${netDueSubscribers > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {netDueSubscribers.toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-bold">GNF</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Acomptes : <strong className="text-emerald-400 font-bold">{totalAdvances.toLocaleString('fr-FR')} GNF</strong></span>
              <span>Crédits : <strong className="text-red-400 font-bold">{totalCreditBalance.toLocaleString('fr-FR')} GNF</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 4: Trésorerie Nette en Caisse */}
        <div className="glass-card glass-card-hover p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Solde Net en Caisse</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black ${netCashBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netCashBalance.toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-bold">GNF</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>Entrées : <strong className="text-slate-200">{totalCashIn.toLocaleString('fr-FR')}</strong></span>
              <span>Dépenses : <strong className="text-red-400">-{totalExpensesAmount.toLocaleString('fr-FR')}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Jaugeage & Coulage Alert Banner if Gap */}
      {totalGap !== 0 && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${totalGap < 0 ? 'bg-red-950/70 border-red-800 text-red-200' : 'bg-amber-950/70 border-amber-800 text-amber-200'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <span className="font-extrabold text-sm block">
                {totalGap < 0 ? `Alerte Écart de Jaugeage : Coulage / Perte cumulée de ${Math.abs(totalGap).toLocaleString('fr-FR')} Litres` : `Écart de Jaugeage : Excédent de +${totalGap.toLocaleString('fr-FR')} Litres`}
              </span>
              <span className="text-xs opacity-80">
                Valeur financière de l'écart : {Math.abs(totalGap * 12000).toLocaleString('fr-FR')} GNF. Vérifier les jauges ou fuites potentielles.
              </span>
            </div>
          </div>
          <Link
            href="/carburants"
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition shrink-0"
          >
            Vérifier Jauges Cuves
          </Link>
        </div>
      )}

      {/* Main Content Grid: Left Column (Tanks + Personnel) & Right Column (Recent Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Cuves & Taux de Remplissage */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Droplets className="w-5 h-5 text-amber-400" />
                Niveau des Cuves & État Physique des Stocks ({filteredTanks.length} Cuves)
              </h3>
              <Link href="/carburants" className="text-xs font-bold text-red-400 hover:text-red-300">
                Gérer Cuves →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTanks.map((tank) => {
                const fillPercentage = Math.min(100, Math.round((tank.currentStock / tank.capacity) * 100));
                const gap = tank.physicalStock - tank.currentStock;

                return (
                  <div key={tank.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">{tank.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {tank.fuelType}
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${tank.fuelType === 'SUPER' ? 'bg-gradient-to-r from-red-600 to-rose-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`} 
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>
                        <span>Théorique :</span>
                        <strong className="block text-white font-mono">{tank.currentStock.toLocaleString('fr-FR')} L</strong>
                      </div>
                      <div>
                        <span>Jauge Règle :</span>
                        <strong className="block text-amber-300 font-mono">{tank.physicalStock.toLocaleString('fr-FR')} L</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span>Écart / Coulage :</span>
                      <span className={`font-bold font-mono ${gap < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {gap > 0 ? `+${gap} L` : `${gap} L`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Dernières Tournées Pompes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Fuel className="w-5 h-5 text-red-500" />
                Derniers Relevés de Tournées Pompes
              </h3>
              <Link href="/carburants" className="text-xs font-bold text-slate-400 hover:text-white">
                Voir tout →
              </Link>
            </div>

            <div className="space-y-2.5">
              {filteredShifts.slice(0, 4).map((sh) => (
                <div key={sh.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">{sh.pumpName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{sh.shiftType}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{sh.timestamp}</span>
                    </div>
                    <span className="text-slate-400 mt-0.5 block">
                      Pompiste : <strong className="text-slate-200">{sh.pompisteName}</strong> | {sh.litersSold.toLocaleString('fr-FR')} L vendus
                    </span>
                  </div>

                  <div className="text-right font-black text-red-400 font-mono">
                    {sh.totalAmount.toLocaleString('fr-FR')} GNF
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col (1 Column): Abonnés & Dépenses récentes */}
        <div className="space-y-6">
          
          {/* Derniers Versements Abonnés */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Versements Abonnés
              </h3>
              <Link href="/abonnes" className="text-xs font-bold text-blue-400 hover:text-blue-300">
                Abonnés →
              </Link>
            </div>

            <div className="space-y-3">
              {filteredPayments.slice(0, 3).map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-white">{p.subscriberName || 'Abonné'}</span>
                    <span className="font-black text-emerald-400 font-mono">+{p.amount.toLocaleString('fr-FR')} GNF</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Déposant : <strong className="text-slate-200">{p.payerName}</strong>
                  </div>
                  <div className="text-[10px] text-amber-300 font-mono">
                    N° Compte : {p.accountNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Situation Effectif & Masse Salariale */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Ressources Humaines & Paie
              </h3>
              <Link href="/rh-salaires" className="text-xs font-bold text-red-400 hover:text-red-300">
                Fiches RH →
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Collaborateurs Actifs :</span>
                <span className="font-bold text-white">{filteredEmployees.length} employés</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Retenues Manquants :</span>
                <span className="font-bold text-red-400">
                  -{filteredEmployees.reduce((a, b) => a + b.shortages, 0).toLocaleString('fr-FR')} GNF
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black">
                <span className="text-slate-300">Masse Salariale Nette :</span>
                <span className="text-emerald-400">{totalPayrollNet.toLocaleString('fr-FR')} GNF</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
