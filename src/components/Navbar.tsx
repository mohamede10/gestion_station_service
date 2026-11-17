"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStation } from '@/context/StationContext';
import { Building2, ShieldCheck, Clock, LogOut, Sparkles, RotateCcw, ChevronDown, Download } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const {
    stations,
    currentStation,
    setCurrentStation,
    userRole,
    resetAllData,
    currentUser,
    logout,
    askConfirm
  } = useStation();

  const [time, setTime] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) +
        ' - ' +
        now.toLocaleTimeString('fr-FR')
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setShowUserMenu(false);
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'text-amber-400',
    GERANT: 'text-blue-400',
    CHEF_PISTE: 'text-emerald-400',
    CAISSIER: 'text-purple-400',
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    GERANT: 'Gérant',
    CHEF_PISTE: 'Chef Piste',
    CAISSIER: 'Caissier',
  };

  const roleGradients: Record<string, string> = {
    SUPER_ADMIN: 'from-amber-500 to-orange-600',
    GERANT: 'from-blue-500 to-indigo-600',
    CHEF_PISTE: 'from-emerald-500 to-teal-600',
    CAISSIER: 'from-purple-500 to-violet-600',
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 py-3 shadow-xl w-full">
      <div className="w-full flex items-center justify-between gap-4">

        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-1.5 px-2 rounded-xl bg-white shadow-md shadow-black/30 border border-slate-700/40">
            <img
              src="/Logo_TotalEnergies.webp"
              alt="TotalEnergies"
              className="h-8 w-auto object-contain"
            />
            <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white flex items-center gap-1.5">
                TotalEnergies <span className="text-red-500 font-semibold">Station</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/50">
                <Sparkles className="w-3 h-3 text-red-400" />Multi-Stations
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{time || 'Chargement...'}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Station Selector (SuperAdmin only) */}
          {userRole === 'SUPER_ADMIN' && (
            <div className="relative">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-slate-300">
                <Building2 className="w-4 h-4 text-red-500 shrink-0" />
                <span className="hidden sm:inline font-medium text-slate-400">Station :</span>
                <select
                  className="bg-transparent text-white font-semibold outline-none cursor-pointer pr-1 text-xs max-w-[140px] sm:max-w-none truncate"
                  value={currentStation ? currentStation.id : 'all'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'all') {
                      setCurrentStation(null);
                    } else {
                      const st = stations.find(s => s.id === val);
                      if (st) setCurrentStation(st);
                    }
                  }}
                >
                  <option value="all" className="bg-slate-900 text-amber-400 font-bold">
                    VUE CONSOLIDÉE (Toutes)
                  </option>
                  {stations.map((st) => (
                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* For non-superadmin: show their station */}
          {userRole !== 'SUPER_ADMIN' && currentStation && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-semibold text-white truncate max-w-[160px]">{currentStation.name}</span>
            </div>
          )}

          {/* Install PWA Button */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                if (window.triggerPWAInstall) {
                  window.triggerPWAInstall();
                } else {
                  alert("Pour installer l'application directement :\n• Sur Chrome PC/Mac : Cliquez sur l'icône d'installation dans la barre d'adresse en haut à droite (ou menu ⋮ > 'Installer TotalEnergies').\n• Sur Mobile Android : Menu ⋮ > 'Installer l'application'.");
                }
              }
            }}
            title="Installer l'application PWA"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 transition text-xs font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">Installer l'App</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={() => {
              askConfirm({
                title: '🔄 Réinitialisation des données',
                message: 'Voulez-vous réinitialiser toutes les données de démonstration ? Cette action remettra tous les stocks, soldes et index à zéro.',
                confirmLabel: 'Réinitialiser',
                cancelLabel: 'Annuler',
                onConfirm: resetAllData
              });
            }}
            title="Réinitialiser les données de démo"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Certified Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Certifié</span>
          </div>

          {/* User Menu */}
          {currentUser && (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-lg px-2.5 py-1.5 transition group"
              >
                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${roleGradients[userRole]} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-white text-xs font-bold leading-none truncate max-w-[100px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className={`text-[10px] font-semibold ${roleColors[userRole]} leading-none`}>
                    {roleLabels[userRole]}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="p-4 border-b border-slate-800">
                    <div className={`flex items-center gap-3`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleGradients[userRole]} flex items-center justify-center text-white font-black text-base`}>
                        {currentUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white text-sm font-bold leading-tight">{currentUser.name}</div>
                        <div className={`text-xs font-semibold ${roleColors[userRole]}`}>{roleLabels[userRole]}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{currentUser.email}</div>
                      </div>
                    </div>
                    {currentUser.stationName && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/60 rounded-lg px-2.5 py-1.5">
                        <Building2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{currentUser.stationName}</span>
                      </div>
                    )}
                  </div>
                  {/* Logout */}
                  <div className="p-2">
                    <button
                      id="logout-btn"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition text-sm font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Se Déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}
    </header>
  );
}
