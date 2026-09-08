"use client";

import React, { useState } from 'react';
import { useStation } from '@/context/StationContext';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  ExternalLink, 
  Fuel, 
  Users, 
  Coins 
} from 'lucide-react';

export default function StationsPage() {
  const { 
    stations, 
    addStation, 
    setCurrentStation, 
    currentStation, 
    userRole, 
    tanks, 
    pumps, 
    subscribers 
  } = useStation();

  // Form State
  const [code, setCode] = useState<string>('ST-LABE');
  const [name, setName] = useState<string>('TotalEnergies Labé Centre');
  const [city, setCity] = useState<string>('Labé');

  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;

    const newSt = addStation({
      code,
      name,
      city
    });

    alert(`Station-Service "${newSt.name}" déployée avec succès avec cuves et pompes initialisées !`);
    setCode('ST-' + Math.random().toString(36).substring(2, 6).toUpperCase());
    setName('');
    setCity('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" /> CONSOLE DE SUPERVISION SUPER-ADMIN MULTI-STATIONS
          </div>
          <h2 className="text-2xl font-black text-white">Réseau National des Stations-Services TotalEnergies</h2>
          <p className="text-xs text-slate-400 mt-1">
            Création de stations dans d'autres villes (Kindia, Labé, Mamou, Kankan, Nzérékoré...) avec cloisonnement étanche des données.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400 text-xs font-bold flex items-center gap-2">
          <span>Total Réseau :</span>
          <strong className="text-white font-mono text-sm">{stations.length} Stations</strong>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulaire Création Nouvelle Station (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-base">Déployer une Nouvelle Station</h3>
          </div>

          <form onSubmit={handleCreateStation} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Code Station :</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nom de la Station :</label>
              <input
                type="text"
                required
                placeholder="ex: TotalEnergies Kankan Aéroport"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-amber-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ville / Préfecture :</label>
              <input
                type="text"
                required
                placeholder="ex: Kankan, Labé, Boké..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-amber-500"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block">Initialisation Automatique :</span>
              <div>• 2 Cuves (Cuve 01 Super & Cuve 02 Gazoil)</div>
              <div>• 2 Pompes électroniques étalonnées</div>
              <div>• Espace de gestion étanche pour le gérant local</div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition"
            >
              <ShieldCheck className="w-4 h-4" /> Créer & Déployer la Station
            </button>
          </form>
        </div>

        {/* Liste des Stations Réseau (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Réseau des Stations-Services Déployées ({stations.length})
            </h3>
            <button
              onClick={() => setCurrentStation(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
            >
              🌐 Passer en Vue Consolidée
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stations.map((st) => {
              const isSelected = currentStation?.id === st.id;
              const stTanks = tanks.filter(t => t.stationId === st.id);
              const stPumps = pumps.filter(p => p.stationId === st.id);
              const stSubs = subscribers.filter(s => s.stationId === st.id);

              return (
                <div 
                  key={st.id} 
                  className={`p-4 rounded-xl border transition space-y-3 ${isSelected ? 'bg-slate-900 border-red-500/80 shadow-lg shadow-red-950/40' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm text-white block">{st.name}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" /> {st.city}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                      {st.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="block font-bold text-white">{stTanks.length}</span>
                      <span>Cuves</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="block font-bold text-white">{stPumps.length}</span>
                      <span>Pompes</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="block font-bold text-white">{stSubs.length}</span>
                      <span>Abonnés</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> En ligne
                    </span>

                    <button
                      onClick={() => setCurrentStation(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${isSelected ? 'bg-red-600 text-white shadow-md shadow-red-900/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                    >
                      {isSelected ? 'Station Active' : 'Gérer cette station'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
