"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Fuel, 
  Radio,
  PackageCheck, 
  CreditCard, 
  Receipt, 
  Users, 
  Building2,
  ChevronRight,
  ShieldAlert,
  BarChart2
} from 'lucide-react';

interface SidebarProps {
  userRole: 'SUPER_ADMIN' | 'GERANT' | 'CHEF_PISTE' | 'CAISSIER';
  stationName: string;
}

export default function Sidebar({ userRole, stationName }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Tableau de Bord', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'GERANT', 'CHEF_PISTE', 'CAISSIER'] },
    { href: '/telematics', label: 'Cuves & Sondes IoT', icon: Radio, roles: ['SUPER_ADMIN', 'GERANT', 'CHEF_PISTE'], badge: 'LIVE' },
    { href: '/statistiques', label: 'Statistiques & Rapports', icon: BarChart2, roles: ['SUPER_ADMIN', 'GERANT'] },
    { href: '/carburants', label: 'Carburants & Pompes', icon: Fuel, roles: ['SUPER_ADMIN', 'GERANT', 'CHEF_PISTE'] },
    { href: '/abonnes', label: 'Abonnés & Factures', icon: CreditCard, roles: ['SUPER_ADMIN', 'GERANT', 'CAISSIER', 'CHEF_PISTE'] },
    { href: '/caisse', label: 'Caisse & Dépenses', icon: Receipt, roles: ['SUPER_ADMIN', 'GERANT', 'CAISSIER'] },
    { href: '/lubrifiants', label: 'Lubrifiants & Gaz', icon: PackageCheck, roles: ['SUPER_ADMIN', 'GERANT', 'CHEF_PISTE'] },
    { href: '/rh-salaires', label: 'RH & Bulletins Paie', icon: Users, roles: ['SUPER_ADMIN', 'GERANT'] },
    { href: '/stations', label: 'Console Multi-Stations', icon: Building2, roles: ['SUPER_ADMIN'] },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
      <div>
        
        {/* Active Station Context Banner */}
        <div className="mb-6 p-3 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Station Active</div>
          <div className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {stationName}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rôle :</span>
            <span className="font-semibold text-red-400">{userRole}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Modules de Gestion
          </div>
          {navItems.map((item) => {
            const isAllowed = item.roles.includes(userRole);
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (!isAllowed) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Security & Audit Footer */}
      <div className="pt-4 border-t border-slate-900">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 text-[11px] text-slate-400 border border-slate-800/50">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="leading-tight">
            <span className="font-bold text-slate-300 block">Horodatage Certifié</span>
            <span>Toutes actions tracées</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
