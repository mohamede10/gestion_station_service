"use client";

import React, { useState, useMemo } from 'react';
import { useStation } from '@/context/StationContext';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Fuel, Truck, Receipt,
  CreditCard, Users, Building2, BarChart2, Filter,
  Calendar, Droplets, Wallet, ArrowUpRight, ArrowDownRight,
  FileText, ChevronDown
} from 'lucide-react';

type Period = 'JOUR' | 'SEMAINE' | 'MOIS' | 'ANNEE';

// ─── Helpers de filtrage par date ────────────────────────────────────────────
function getStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case 'JOUR':    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'SEMAINE': { const d = new Date(now); d.setDate(d.getDate() - 6); return d; }
    case 'MOIS':    return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'ANNEE':   return new Date(now.getFullYear(), 0, 1);
  }
}

function inPeriod(timestamp: string, period: Period): boolean {
  const d = new Date(timestamp.replace(' ', 'T'));
  return d >= getStartDate(period);
}

// ─── Génération des buckets pour les graphiques ──────────────────────────────
function buildRevenueBuckets(
  shifts: ReturnType<typeof useStation>['pumpShifts'],
  period: Period,
  stationIds: Set<string>
): { label: string; Super: number; Gazoil: number }[] {
  const now = new Date();

  if (period === 'JOUR') {
    // 8 tranches de 3h
    const buckets = Array.from({ length: 8 }, (_, i) => ({
      label: `${String(i * 3).padStart(2, '0')}h`,
      Super: 0, Gazoil: 0
    }));
    shifts.filter(s => stationIds.has(s.stationId) && inPeriod(s.timestamp, period)).forEach(s => {
      const h = new Date(s.timestamp.replace(' ', 'T')).getHours();
      const idx = Math.floor(h / 3);
      if (s.fuelType === 'SUPER') buckets[idx].Super += s.totalAmount;
      else buckets[idx].Gazoil += s.totalAmount;
    });
    return buckets;
  }

  if (period === 'SEMAINE') {
    const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - 6 + i);
      return { label: jours[d.getDay() === 0 ? 6 : d.getDay() - 1], Super: 0, Gazoil: 0, _date: d };
    });
    shifts.filter(s => stationIds.has(s.stationId) && inPeriod(s.timestamp, period)).forEach(s => {
      const sd = new Date(s.timestamp.replace(' ', 'T'));
      const idx = buckets.findIndex(b => b._date.toDateString() === sd.toDateString());
      if (idx >= 0) {
        if (s.fuelType === 'SUPER') buckets[idx].Super += s.totalAmount;
        else buckets[idx].Gazoil += s.totalAmount;
      }
    });
    return buckets.map(({ label, Super, Gazoil }) => ({ label, Super, Gazoil }));
  }

  if (period === 'MOIS') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const buckets = Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1),
      Super: 0, Gazoil: 0
    }));
    shifts.filter(s => stationIds.has(s.stationId) && inPeriod(s.timestamp, period)).forEach(s => {
      const day = new Date(s.timestamp.replace(' ', 'T')).getDate() - 1;
      if (s.fuelType === 'SUPER') buckets[day].Super += s.totalAmount;
      else buckets[day].Gazoil += s.totalAmount;
    });
    return buckets;
  }

  // ANNEE → 12 mois
  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const buckets = moisLabels.map(label => ({ label, Super: 0, Gazoil: 0 }));
  shifts.filter(s => stationIds.has(s.stationId) && inPeriod(s.timestamp, period)).forEach(s => {
    const m = new Date(s.timestamp.replace(' ', 'T')).getMonth();
    if (s.fuelType === 'SUPER') buckets[m].Super += s.totalAmount;
    else buckets[m].Gazoil += s.totalAmount;
  });
  return buckets;
}

function buildLitersBuckets(
  shifts: ReturnType<typeof useStation>['pumpShifts'],
  period: Period,
  stationIds: Set<string>
): { label: string; litres: number }[] {
  const revenue = buildRevenueBuckets(shifts, period, stationIds);
  const litersMap: Record<string, number> = {};
  shifts.filter(s => stationIds.has(s.stationId) && inPeriod(s.timestamp, period)).forEach(s => {
    let label = '';
    const d = new Date(s.timestamp.replace(' ', 'T'));
    if (period === 'JOUR') label = `${String(Math.floor(d.getHours() / 3) * 3).padStart(2, '0')}h`;
    else if (period === 'SEMAINE') {
      const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      label = jours[d.getDay() === 0 ? 6 : d.getDay() - 1];
    } else if (period === 'MOIS') label = String(d.getDate());
    else {
      const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      label = mois[d.getMonth()];
    }
    litersMap[label] = (litersMap[label] || 0) + s.litersSold;
  });
  return revenue.map(r => ({ label: r.label, litres: litersMap[r.label] || 0 }));
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name} :</span>
          <span className="font-bold text-white">
            {typeof p.value === 'number' && p.value > 1000
              ? p.value.toLocaleString('fr-FR')
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, unit, color, icon: Icon, trend, trendLabel
}: {
  label: string; value: string | number; unit?: string; color: string;
  icon: React.ElementType; trend?: 'up' | 'down' | 'neutral'; trendLabel?: string;
}) {
  return (
    <div className={`bg-slate-900 border rounded-2xl p-4 relative overflow-hidden flex flex-col gap-1 ${color.includes('amber') ? 'border-amber-900/40' : color.includes('emerald') ? 'border-emerald-900/40' : color.includes('red') ? 'border-red-900/40' : color.includes('blue') ? 'border-blue-900/40' : color.includes('purple') ? 'border-purple-900/40' : 'border-slate-800'}`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color.includes('amber') ? '#f59e0b' : color.includes('emerald') ? '#10b981' : color.includes('red') ? '#ef4444' : color.includes('blue') ? '#3b82f6' : color.includes('purple') ? '#a855f7' : '#64748b' }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className={`text-2xl font-black ${color} font-mono mt-1`}>
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        {unit && <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span>}
      </div>
      {trendLabel && (
        <div className={`text-[11px] flex items-center gap-1 font-semibold mt-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
          {trendLabel}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function StatistiquesPage() {
  const {
    currentStation, stations, userRole,
    pumpShifts, deliveries, expenses, payments,
    employees, subscribers, tanks
  } = useStation();

  const [period, setPeriod] = useState<Period>('SEMAINE');
  const [filterStationId, setFilterStationId] = useState<string>('ALL');

  // Résolution des IDs de stations à afficher
  const visibleStationIds = useMemo<Set<string>>(() => {
    if (userRole === 'SUPER_ADMIN') {
      if (filterStationId === 'ALL') return new Set(stations.map(s => s.id));
      return new Set([filterStationId]);
    }
    if (currentStation) return new Set([currentStation.id]);
    return new Set(stations.map(s => s.id));
  }, [userRole, filterStationId, stations, currentStation]);

  const stationLabel = useMemo(() => {
    if (userRole !== 'SUPER_ADMIN' && currentStation) return currentStation.name;
    if (filterStationId === 'ALL') return 'Tout le Réseau';
    return stations.find(s => s.id === filterStationId)?.name || 'Station';
  }, [userRole, filterStationId, stations, currentStation]);

  // Filtres par période
  const filteredShifts  = useMemo(() => pumpShifts.filter(s => visibleStationIds.has(s.stationId) && inPeriod(s.timestamp, period)), [pumpShifts, visibleStationIds, period]);
  const filteredDeliv   = useMemo(() => deliveries.filter(d => visibleStationIds.has(d.stationId) && inPeriod(d.timestamp, period)), [deliveries, visibleStationIds, period]);
  const filteredExp     = useMemo(() => expenses.filter(e => visibleStationIds.has(e.stationId) && inPeriod(e.timestamp, period)), [expenses, visibleStationIds, period]);
  const filteredPay     = useMemo(() => payments.filter(p => visibleStationIds.has(p.stationId) && inPeriod(p.timestamp, period)), [payments, visibleStationIds, period]);
  const filteredEmps    = useMemo(() => employees.filter(e => visibleStationIds.has(e.stationId)), [employees, visibleStationIds]);
  const filteredSubs    = useMemo(() => subscribers.filter(s => visibleStationIds.has(s.stationId)), [subscribers, visibleStationIds]);
  const filteredTanks   = useMemo(() => tanks.filter(t => visibleStationIds.has(t.stationId)), [tanks, visibleStationIds]);

  // KPIs
  const totalRecettes   = filteredShifts.reduce((a, s) => a + s.totalAmount, 0);
  const totalLitres     = filteredShifts.reduce((a, s) => a + s.litersSold, 0);
  const totalLivraisons = filteredDeliv.reduce((a, d) => a + d.litersDelivered, 0);
  const totalDepenses   = filteredExp.reduce((a, e) => a + e.amount, 0);
  const totalVersements = filteredPay.reduce((a, p) => a + p.amount, 0);
  const totalSalaires   = filteredEmps.reduce((a, e) => a + (e.baseSalary + e.transportAllowance + e.livingAllowance + e.housingAllowance), 0);
  const resultatNet     = totalRecettes - totalDepenses;
  const tauxRemplissage = filteredTanks.length > 0
    ? Math.round(filteredTanks.reduce((a, t) => a + (t.capacity > 0 ? t.currentStock / t.capacity : 0), 0) / filteredTanks.length * 100)
    : 0;

  // Graphiques
  const revenueBuckets  = useMemo(() => buildRevenueBuckets(pumpShifts, period, visibleStationIds), [pumpShifts, period, visibleStationIds]);
  const litersBuckets   = useMemo(() => buildLitersBuckets(pumpShifts, period, visibleStationIds), [pumpShifts, period, visibleStationIds]);

  // Pie: Super vs Gazoil
  const superLitres   = filteredShifts.filter(s => s.fuelType === 'SUPER').reduce((a, s) => a + s.litersSold, 0);
  const gazoilLitres  = filteredShifts.filter(s => s.fuelType === 'GAZOIL').reduce((a, s) => a + s.litersSold, 0);
  const pieData = [
    { name: 'Super (Essence)', value: superLitres || 0 },
    { name: 'Gazoil (Diesel)', value: gazoilLitres || 0 },
  ];

  // Dépenses par catégorie
  const expCatLabels: Record<string, string> = {
    EDG: 'ÉDG', GROUPE_ELECTROGENE: 'Groupe', TELEPHONE_INTERNET: 'Télécom',
    TRANSPORT: 'Transport', ENTRETIEN_REPARATIONS: 'Entretien',
    FOURNITURES: 'Fournitures', DIVERS: 'Divers'
  };
  const expByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExp.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([cat, total]) => ({ label: expCatLabels[cat] || cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExp]);

  const periodLabel: Record<Period, string> = {
    JOUR: "Aujourd'hui", SEMAINE: '7 Derniers Jours', MOIS: 'Ce Mois', ANNEE: 'Cette Année'
  };

  const PIE_COLORS = ['#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <BarChart2 className="w-4 h-4" /> ANALYTICS & REPORTING — TOTALENERGIES
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Statistiques Globales & Rapports
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {stationLabel} · Période : <span className="text-amber-400 font-bold">{periodLabel[period]}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtre Station (Super Admin uniquement) */}
            {userRole === 'SUPER_ADMIN' && (
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  className="pl-8 pr-8 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white border border-slate-700 outline-none focus:border-amber-500 appearance-none cursor-pointer"
                  value={filterStationId}
                  onChange={e => setFilterStationId(e.target.value)}
                >
                  <option value="ALL">🌐 Tout le Réseau</option>
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Sélecteur Période */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 gap-0.5">
              {(['JOUR', 'SEMAINE', 'MOIS', 'ANNEE'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-2 rounded-lg text-[11px] font-black transition ${
                    period === p
                      ? 'bg-amber-500 text-slate-950 shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Recettes Carburant" value={totalRecettes} unit="GNF" color="text-amber-400" icon={Fuel}
          trend={totalRecettes > 0 ? 'up' : 'neutral'} trendLabel="Ventes pompes" />
        <KpiCard label="Litres Vendus" value={totalLitres} unit="L" color="text-orange-400" icon={Droplets}
          trend={totalLitres > 0 ? 'up' : 'neutral'} trendLabel={`${filteredShifts.length} tournée(s)`} />
        <KpiCard label="Livraisons Reçues" value={totalLivraisons} unit="L" color="text-blue-400" icon={Truck}
          trend="neutral" trendLabel={`${filteredDeliv.length} BL réceptionné(s)`} />
        <KpiCard label="Dépenses Caisse" value={totalDepenses} unit="GNF" color="text-red-400" icon={Receipt}
          trend={totalDepenses > 0 ? 'down' : 'neutral'} trendLabel={`${filteredExp.length} sortie(s)`} />
        <KpiCard label="Versements Abonnés" value={totalVersements} unit="GNF" color="text-emerald-400" icon={CreditCard}
          trend={totalVersements > 0 ? 'up' : 'neutral'} trendLabel={`${filteredSubs.length} abonn\u00e9(s) actif(s)`} />
        <KpiCard label="Masse Salariale" value={totalSalaires} unit="GNF" color="text-purple-400" icon={Users}
          trend="neutral" trendLabel={`${filteredEmps.length} employé(s)`} />
        <KpiCard
          label="Résultat Net Estimé"
          value={resultatNet}
          unit="GNF"
          color={resultatNet >= 0 ? 'text-emerald-400' : 'text-red-400'}
          icon={resultatNet >= 0 ? TrendingUp : TrendingDown}
          trend={resultatNet >= 0 ? 'up' : 'down'}
          trendLabel={resultatNet >= 0 ? 'Bénéfice' : 'Déficit'}
        />
        <KpiCard label="Remplissage Cuves" value={tauxRemplissage} unit="%" color="text-cyan-400" icon={Wallet}
          trend={tauxRemplissage > 50 ? 'up' : 'down'} trendLabel={`${filteredTanks.length} cuve(s)`} />
      </div>

      {/* ── Graphiques Ligne 1 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* BarChart: Recettes par période */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Recettes Carburant (GNF)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{periodLabel[period]} · Super & Gazoil</p>
            </div>
          </div>
          {revenueBuckets.every(b => b.Super === 0 && b.Gazoil === 0) ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-500">
              <BarChart2 className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs font-semibold">Aucune vente enregistrée</p>
              <p className="text-[11px]">Saisissez des tournées pompes pour voir les données</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueBuckets} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}k` : String(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Super" name="Super" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Gazoil" name="Gazoil" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AreaChart: Évolution litres vendus */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Évolution Litres Vendus
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{periodLabel[period]} · Tendance globale</p>
            </div>
          </div>
          {litersBuckets.every(b => b.litres === 0) ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-500">
              <Droplets className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs font-semibold">Aucun litre enregistré</p>
              <p className="text-[11px]">Les données apparaissent après les saisies pompes</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={litersBuckets} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLitres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="litres" name="Litres vendus" stroke="#06b6d4" strokeWidth={2.5} fill="url(#colorLitres)" dot={{ fill: '#06b6d4', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Graphiques Ligne 2 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* PieChart: Super vs Gazoil */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Répartition Super vs Gazoil
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Volume vendu en litres · {periodLabel[period]}</p>
          </div>
          {superLitres === 0 && gazoilLitres === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-500">
              <Fuel className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs font-semibold">Aucune vente dans la période</p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} L`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-amber-300">Super (Essence)</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">{superLitres.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">L</span></div>
                  <div className="text-[11px] text-slate-400">{totalLitres > 0 ? Math.round(superLitres / totalLitres * 100) : 0}% du volume</div>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-blue-900/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-blue-400" />
                    <span className="text-xs font-bold text-blue-300">Gazoil (Diesel)</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">{gazoilLitres.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">L</span></div>
                  <div className="text-[11px] text-slate-400">{totalLitres > 0 ? Math.round(gazoilLitres / totalLitres * 100) : 0}% du volume</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BarChart: Dépenses par catégorie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Dépenses par Catégorie
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sorties de caisse · {periodLabel[period]}</p>
          </div>
          {expByCategory.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-500">
              <Receipt className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs font-semibold">Aucune dépense dans la période</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={expByCategory} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}k`} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} width={72} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Montant (GNF)" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Tableau Rapport Détaillé ──────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Rapport Détaillé — Tournées Pompes
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filteredShifts.length} tournée(s) · {periodLabel[period]} · {stationLabel}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
            TOTAL : {totalRecettes.toLocaleString('fr-FR')} GNF
          </span>
        </div>

        {filteredShifts.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold">Aucune tournée dans la période sélectionnée</p>
            <p className="text-xs mt-1">Saisissez des tournées dans la section Carburants & Pompes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800">
                <tr>
                  {['Date & Heure', 'Station', 'Pompe', 'Carburant', 'Pompiste', 'Shift', 'Litres Vendus', 'Recette (GNF)'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[...filteredShifts].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map(shift => {
                  const st = stations.find(s => s.id === shift.stationId);
                  return (
                    <tr key={shift.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">{shift.timestamp}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">{st?.name || shift.stationId}</td>
                      <td className="px-4 py-3 text-white font-semibold">{shift.pumpName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${shift.fuelType === 'SUPER' ? 'bg-amber-950/60 text-amber-300 border-amber-800/40' : 'bg-blue-950/60 text-blue-300 border-blue-800/40'}`}>
                          {shift.fuelType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{shift.pompisteName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${shift.shiftType === 'MATIN' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' : shift.shiftType === 'SOIR' ? 'bg-purple-950/40 text-purple-400 border-purple-900/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {shift.shiftType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">{shift.litersSold.toLocaleString('fr-FR')} L</td>
                      <td className="px-4 py-3 font-mono font-black text-emerald-400">{shift.totalAmount.toLocaleString('fr-FR')}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-950/50 border-t-2 border-slate-700">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-xs font-bold text-slate-300">TOTAUX — {filteredShifts.length} tournée(s)</td>
                  <td className="px-4 py-3 font-mono font-black text-cyan-300">{totalLitres.toLocaleString('fr-FR')} L</td>
                  <td className="px-4 py-3 font-mono font-black text-emerald-300">{totalRecettes.toLocaleString('fr-FR')} GNF</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Tableau Livraisons ────────────────────────────────────────────────── */}
      {filteredDeliv.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              Livraisons Reçues · {periodLabel[period]}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40 ml-2">
                {totalLivraisons.toLocaleString('fr-FR')} L au total
              </span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800">
                <tr>
                  {['Date', 'Station', 'Cuve', 'Carburant', 'Litres', 'Fournisseur', 'Camion'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[...filteredDeliv].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map(d => {
                  const st = stations.find(s => s.id === d.stationId);
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">{d.timestamp}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">{st?.name || d.stationId}</td>
                      <td className="px-4 py-3 text-white font-semibold">{d.tankCode}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${d.fuelType === 'SUPER' ? 'bg-amber-950/60 text-amber-300 border-amber-800/40' : 'bg-blue-950/60 text-blue-300 border-blue-800/40'}`}>{d.fuelType}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-400">{d.litersDelivered.toLocaleString('fr-FR')} L</td>
                      <td className="px-4 py-3 text-slate-300">{d.supplier}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{d.truckPlate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
